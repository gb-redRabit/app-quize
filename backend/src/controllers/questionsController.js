const Question = require("../models/Question");
const QuestionNot = Question;
const Stats = require("../models/Stats");
const ExcelJS = require("exceljs");
const { setCache, getCache, clearCache } = require("../utils/cache");
const { parseWorkbook } = require("../utils/excelImport");
const { validateQuestionPayload } = require("../utils/validateQuestion");
const CACHE_KEY = "stats";

// Cache pełnych list kategorii (krótki TTL, ograniczona liczba wpisów).
const categoryCache = new Map();
const CATEGORY_CACHE_TTL_MS = 60 * 1000;
const CATEGORY_CACHE_MAX = 10;

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
    const updatedQuestion = await Question.findOneAndUpdate(
      { ID: Number(id) },
      value,
      { new: true }
    );
    await updateStats();
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
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

    await updateStats();

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Nie znaleziono pytania do usunięcia" });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: "Błąd usuwania pytania" });
  }
};

// Eksportuj pytania do Excela
exports.exportQuestionsToExcel = async (req, res) => {
  try {
    const questions = await QuestionNot.find({}, null, { sort: { ID: 1 } });

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

    questions.forEach((q) => {
      worksheet.addRow({
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
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=questions.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    res.status(500).json({ message: "Error exporting questions" });
  }
};

// Wyczyść wszystkie pytania
exports.clearQuestions = async (req, res) => {
  try {
    await Question.deleteMany({});
    await updateStats();
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
  const cached = getCache(CACHE_KEY);
  if (cached) return res.json(cached);

  const stats = await Stats.findOne({});
  setCache(CACHE_KEY, stats || { totalQuestions: 0, categories: [] });
  res.json(stats || { totalQuestions: 0, categories: [] });
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
