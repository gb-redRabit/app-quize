const Question = require("../models/Question");
const QuestionNot = Question;
const Stats = require("../models/Stats");
const ExcelJS = require("exceljs");
const { setCache, getCache, clearCache } = require("../utils/cache");
const { parseWorkbook } = require("../utils/excelImport");
const { validateQuestionPayload } = require("../utils/validateQuestion");
const events = require("../utils/events");
const {
  bumpQuestionsVersion,
  getQuestionsVersion,
} = require("../utils/questionsVersion");
const { logQuestionChange, logQuestionBulkChange } = require("../utils/questionChanges");
const CACHE_KEY = "stats";

// Cache pełnych list kategorii (krótki TTL, ograniczona liczba wpisów).
const categoryCache = new Map();
const CATEGORY_CACHE_TTL_MS = 60 * 1000;
const CATEGORY_CACHE_MAX = 30;

function getCategoryCache(key) {
  const entry = categoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    categoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCategoryCache(key, data) {
  if (categoryCache.size >= CATEGORY_CACHE_MAX) {
    const oldestKey = categoryCache.keys().next().value;
    categoryCache.delete(oldestKey);
  }
  categoryCache.set(key, { data, expiresAt: Date.now() + CATEGORY_CACHE_TTL_MS });
}

function invalidateCategoryCache() {
  categoryCache.clear();
}

// Zabezpieczenie przed równoległym importem (jeden plik na raz).
let importInProgress = false;

// Wersja bazy pytań (publiczna — pokazywana też na ekranie logowania).
exports.getQuestionsVersionInfo = async (req, res) => {
  try {
    const { version, updatedAt } = await getQuestionsVersion();
    const etag = `W/"questions-version-${version}"`;
    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }
    const count = await Question.estimatedDocumentCount();
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "private, max-age=30");
    res.json({ version, updatedAt, count });
  } catch (e) {
    res.status(500).json({ message: "Błąd pobierania wersji pytań" });
  }
};

// Pełny snapshot pytań dla lokalnego cache PWA.
// Snapshot jest duży (8,5 tys. pytań) — trzymamy gotowy JSON w pamięci do
// najbliższej zmiany wersji bazy, zamiast składać go przy każdym żądaniu.
let snapshotCache = null;

exports.getQuestionsSnapshot = async (req, res) => {
  try {
    const { version, updatedAt } = await getQuestionsVersion();
    const etag = `W/"questions-${version}"`;

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    if (!snapshotCache || snapshotCache.version !== version) {
      const questions = await Question.find({}, { _id: 0, __v: 0 })
        .sort({ ID: 1 })
        .lean();

      // Serializujemy raz na wersję — res.json() robił to przy każdym żądaniu.
      snapshotCache = {
        version,
        body: JSON.stringify({
          version,
          updatedAt,
          count: questions.length,
          questions,
        }),
      };
    }

    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "private, max-age=300");
    res.type("application/json");
    res.send(snapshotCache.body);
  } catch (e) {
    console.error("Błąd snapshotu pytań:", e);
    res.status(500).json({ message: "Błąd pobierania snapshotu pytań" });
  }
};

// Pobierz wszystkie pytania (z paginacją)
exports.getAllQuestions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      500,
      Math.max(1, parseInt(req.query.limit, 10) || 100)
    ); // max 500
    const total = await Question.countDocuments();

    // Jeśli skip przekracza liczbę dokumentów, ustaw na 0 (lub na max dozwolony)
    let skip = Math.max(0, (page - 1) * limit);
    if (skip >= total) skip = 0;

    const questions = await Question.find({}, null, {
      sort: { ID: 1 },
      skip,
      limit,
    }).lean();

    res.json({
      questions,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    });
  } catch (e) {
    res.status(500).json({ message: "Error fetching questions" });
  }
};

// Dodaj pytanie
exports.addQuestion = async (req, res) => {
  try {
    const { errors, value } = validateQuestionPayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: errors.join("; ") });
    }

    const last = await Question.findOne({}, null, { sort: { ID: -1 } });
    const nextID = last && last.ID ? last.ID + 1 : 1;

    const question = new Question({ ...value, ID: nextID });
    await question.save();

    await updateStats();
    const { version } = await bumpQuestionsVersion();
    await logQuestionChange(version, "upsert", nextID);
    events.emit("questions-changed", {
      type: "create",
      ID: nextID,
      question,
      version,
    });

    res.status(201).json({ message: "Question added", ID: nextID });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error adding question", error: e.message });
  }
};

// Edytuj pytanie
exports.updateQuestion = async (req, res) => {
  try {
    const { errors, value } = validateQuestionPayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: errors.join("; ") });
    }

    const { id } = req.params;
    const existing = await Question.findOne({ ID: Number(id) });
    if (!existing) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Optymistyczne wykrywanie konfliktów: klient wysyła wersję, którą edytował.
    const expected = req.body.expectedUpdatedAt;
    if (expected && existing.updatedAt) {
      const expectedTime = new Date(expected).getTime();
      const currentTime = new Date(existing.updatedAt).getTime();
      if (Number.isFinite(expectedTime) && expectedTime !== currentTime) {
        return res.status(409).json({
          message:
            "Pytanie zostało zmienione w innym miejscu. Odśwież dane i spróbuj ponownie.",
          conflict: true,
          question: existing,
        });
      }
    }

    const updatedQuestion = await Question.findOneAndUpdate(
      { ID: Number(id) },
      value,
      { new: true }
    );
    await updateStats();
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    const { version } = await bumpQuestionsVersion();
    await logQuestionChange(version, "upsert", updatedQuestion.ID);
    events.emit("questions-changed", {
      type: "update",
      ID: updatedQuestion.ID,
      question: updatedQuestion,
      version,
    });
    res.json(updatedQuestion);
  } catch (e) {
    res.status(500).json({ message: "Error updating question" });
  }
};

// Usuń pytanie
exports.deleteQuestion = async (req, res) => {
  try {
    const deleted = await Question.findOneAndDelete({
      ID: Number(req.params.id),
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Nie znaleziono pytania do usunięcia" });
    }

    await updateStats();

    const { version } = await bumpQuestionsVersion();
    await logQuestionChange(version, "delete", Number(req.params.id));
    events.emit("questions-changed", {
      type: "delete",
      ID: Number(req.params.id),
      version,
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: "Błąd usuwania pytania" });
  }
};

// Eksportuj pytania do Excela
exports.exportQuestionsToExcel = async (req, res) => {
  try {
    const questions = await QuestionNot.find(
      {},
      "ID question answer_a answer_b answer_c category description flagged bad unknown note",
      { sort: { ID: 1 } }
    ).lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Questions");

    worksheet.columns = [
      { header: "ID", key: "ID", width: 10 },
      { header: "Pytanie", key: "question", width: 50 },
      { header: "Odpowiedź A", key: "answer_a", width: 30 },
      { header: "Poprawna A", key: "isCorret_a", width: 10 },
      { header: "Odpowiedź B", key: "answer_b", width: 30 },
      { header: "Poprawna B", key: "isCorret_b", width: 10 },
      { header: "Odpowiedź C", key: "answer_c", width: 30 },
      { header: "Poprawna C", key: "isCorret_c", width: 10 },
      { header: "Kategoria", key: "category", width: 20 },
      { header: "Opis", key: "description", width: 30 },
      { header: "flagged", key: "flagged", width: 10 },
      { header: "bad", key: "bad", width: 10 },
      { header: "unknown", key: "unknown", width: 10 },
      { header: "note", key: "note", width: 30 },
    ];

    // Jedno wywołanie zamiast tysiąca — zauważalnie szybciej przy pełnej bazie.
    worksheet.addRows(
      questions.map((q) => ({
        ID: q.ID,
        question: q.question,
        answer_a: q.answer_a?.answer,
        isCorret_a: q.answer_a?.isCorret,
        answer_b: q.answer_b?.answer,
        isCorret_b: q.answer_b?.isCorret,
        answer_c: q.answer_c?.answer,
        isCorret_c: q.answer_c?.isCorret,
        category: q.category,
        description: q.description,
        flagged: q.flagged ?? false,
        bad: q.bad ?? false,
        unknown: q.unknown ?? false,
        note: q.note ?? "",
      }))
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=questions.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({ message: "Error exporting questions" });
    } else {
      res.destroy(e);
    }
  }
};

// Wyczyść wszystkie pytania
exports.clearQuestions = async (req, res) => {
  try {
    await Question.deleteMany({});
    await updateStats();
    const { version } = await bumpQuestionsVersion();
    await logQuestionBulkChange(version, "clear");
    events.emit("questions-changed", {
      type: "bulk",
      action: "clear",
      version,
    });
    res.json({ message: "Wyczyszczono wszystkie pytania" });
  } catch (e) {
    res.status(500).json({ message: "Błąd czyszczenia pytań" });
  }
};

// Import pytań z Excela (wiele arkuszy, różne układy kolumn, strumieniowo)
exports.importQuestionsFromExcel = async (req, res) => {
  if (importInProgress) {
    return res.status(409).json({
      message: "Import już trwa. Poczekaj na zakończenie poprzedniego importu.",
    });
  }
  importInProgress = true;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Brak pliku" });
    }

    // Używamy bezpośredniego modelu (bez Agendy) do ustalenia kolejnego ID.
    const last = await QuestionNot.findOne({}, null, { sort: { ID: -1 } });
    const startId = last && last.ID ? last.ID + 1 : 1;

    let inserted = 0;
    const summary = await parseWorkbook(req.file.buffer, {
      startId,
      onBatch: async (docs) => {
        await QuestionNot.insertMany(docs, { ordered: true });
        inserted += docs.length;
      },
    });

    if (inserted > 0) {
      await updateStats();
      const { version } = await bumpQuestionsVersion();
      await logQuestionBulkChange(version, "import");
      events.emit("questions-changed", {
        type: "bulk",
        action: "import",
        count: inserted,
        version,
      });
    }

    res.json({
      message: "Zaimportowano pytania z Excela",
      added: inserted,
      skipped: summary.skipped,
      sheets: summary.sheets,
      errors: summary.errors,
      durationMs: summary.durationMs,
    });
  } catch (e) {
    console.error("Błąd importu z Excela:", e);
    res.status(500).json({
      message: "Błąd importu z Excela",
      error: e.message,
    });
  } finally {
    importInProgress = false;
  }
};

// Funkcja do aktualizacji statystyk (agregacja!)
async function updateStats() {
  const totalQuestions = await Question.countDocuments();
  const categoriesAgg = await Question.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const categories = categoriesAgg.map((cat) => ({
    name: cat._id,
    count: cat.count,
  }));

  await Stats.findOneAndUpdate(
    {},
    { totalQuestions, categories, updatedAt: new Date() },
    { upsert: true }
  );
  clearCache(CACHE_KEY);
  invalidateCategoryCache();
}

// Endpoint statystyk (cache)
exports.getStats = async (req, res) => {
  let stats = getCache(CACHE_KEY);

  if (!stats) {
    stats = await Stats.findOne({});
    setCache(CACHE_KEY, stats || { totalQuestions: 0, categories: [] });
  }

  const payload = stats || { totalQuestions: 0, categories: [] };
  const updatedAt = payload.updatedAt ? new Date(payload.updatedAt).getTime() : 0;
  const etag = `W/"stats-${updatedAt}"`;

  if (req.headers["if-none-match"] === etag) {
    return res.status(304).end();
  }

  res.setHeader("ETag", etag);
  res.setHeader("Cache-Control", "private, max-age=60");
  res.json(payload);
};

// Pobierz pytania wg kategorii
exports.getQuestionsByCategory = async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const filter = category === "all" ? {} : { category };

    // Lekki wariant dla quizu: tylko ID, bez treści i odpowiedzi.
    if (req.query.idsOnly === "1") {
      const rows = await Question.find(filter, { ID: 1, _id: 0 })
        .sort({ ID: 1 })
        .lean();
      return res.json({ ids: rows.map((row) => row.ID) });
    }

    const limit = Math.min(
      500,
      Math.max(0, parseInt(req.query.limit, 10) || 0)
    );

    if (limit > 0) {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageKey = `${category}:${page}:${limit}`;
      const cachedPage = getCategoryCache(pageKey);
      if (cachedPage) {
        res.set("X-Total-Count", String(cachedPage.total));
        return res.json(cachedPage.questions);
      }

      const total = await Question.countDocuments(filter);
      const questions = await Question.find(filter, null, {
        sort: { ID: 1 },
        skip: (page - 1) * limit,
        limit,
      }).lean();
      setCategoryCache(pageKey, { questions, total });
      res.set("X-Total-Count", String(total));
      return res.json(questions);
    }

    // Pełna lista kategorii ma osobny klucz cache — dopiero po obsłużeniu
    // paginacji, żeby żądanie z `limit` nie dostało całej tablicy.
    const cached = getCategoryCache(category);
    if (cached) return res.json(cached);

    const questions = await Question.find(filter, null, { sort: { ID: 1 } }).lean();
    setCategoryCache(category, questions);
    res.json(questions);
  } catch (e) {
    res.status(500).json({ message: "Error fetching questions by category" });
  }
};

exports.invalidateCategoryCache = invalidateCategoryCache;
exports.refreshStats = updateStats;
