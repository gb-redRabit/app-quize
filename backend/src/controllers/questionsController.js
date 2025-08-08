const Question = require("../models/Question");
const Stats = require("../models/Stats");
const ExcelJS = require("exceljs");
const { setCache, getCache, clearCache } = require("../utils/cache");
const CACHE_KEY = "stats";

// Pobierz wszystkie pytania
exports.getAllQuestions = async (req, res) => {
  try {
    // Pobierz parametry paginacji z zapytania
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = (page - 1) * limit;

    const total = await Question.countDocuments();
    const questions = await Question.find()
      .sort({ ID: 1 })
      .skip(skip)
      .limit(limit);

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
    // Znajdź największe ID w bazie
    const last = await Question.findOne().sort({ ID: -1 });
    const nextID = last && last.ID ? last.ID + 1 : 1;

    const question = new Question({ ...req.body, ID: nextID });
    await question.save();

    // Aktualizuj statystyki po dodaniu pytania
    if (typeof Stats.updateStats === "function") {
      await Stats.updateStats();
    } else {
      // Jeśli nie eksportujesz funkcji, możesz zaimportować i wywołać lokalnie
      const Question = require("../models/Question");
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
    }

    res.status(201).json({ message: "Question added" });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error adding question", error: e.message });
  }
};

// Edytuj pytanie
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuestion = await Question.findOneAndUpdate(
      { ID: Number(id) },
      req.body,
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
    // Popraw: szukaj po polu ID, nie _id!
    const deleted = await Question.findOneAndDelete({
      ID: Number(req.params.id),
    });

    // Aktualizuj statystyki po usunięciu pytania
    if (typeof Stats.updateStats === "function") {
      await Stats.updateStats();
    } else {
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
    }

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

exports.exportQuestionsToExcel = async (req, res) => {
  try {
    const questions = await Question.find();

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

exports.clearQuestions = async (req, res) => {
  try {
    await Question.deleteMany({});
    res.json({ message: "Wyczyszczono wszystkie pytania" });
  } catch (e) {
    res.status(500).json({ message: "Błąd czyszczenia pytań" });
  }
};

exports.importQuestionsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Brak pliku" });
    }
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];
    const questions = [];
    function parseBool(val) {
      if (typeof val === "string") return val.trim().toLowerCase() === "true";
      return !!val;
    }

    // Pobierz największe ID z bazy
    const last = await Question.findOne().sort({ ID: -1 });
    let nextID = last && last.ID ? last.ID + 1 : 1;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // pomiń nagłówek
      const [
        ID, // ignoruj ID z pliku
        question,
        answer_a,
        isCorret_a,
        answer_b,
        isCorret_b,
        answer_c,
        isCorret_c,
        category,
        description,
        flagged,
        bad,
        unknown,
        note,
      ] = row.values.slice(1);

      questions.push({
        ID: nextID++, // nadaj kolejne ID
        question,
        answer_a: { answer: answer_a, isCorret: parseBool(isCorret_a) },
        answer_b: { answer: answer_b, isCorret: parseBool(isCorret_b) },
        answer_c: { answer: answer_c, isCorret: parseBool(isCorret_c) },
        category,
        description,
        flagged: parseBool(flagged),
        bad: parseBool(bad),
        unknown: parseBool(unknown),
        note: note ?? "",
      });
    });

    await Question.insertMany(questions);
    res.json({
      message: "Zaimportowano pytania z Excela",
      count: questions.length,
    });
  } catch (e) {
    console.error("Błąd importu z Excela:", e);
    res
      .status(500)
      .json({ message: "Błąd importu z Excela", error: e.message });
  }
};

async function updateStats() {
  const totalQuestions = await Question.countDocuments();
  const categoryNames = await Question.distinct("category");
  const categories = [];

  for (const name of categoryNames) {
    const count = await Question.countDocuments({ category: name });
    categories.push({ name, count });
  }

  await Stats.findOneAndUpdate(
    {},
    { totalQuestions, categories, updatedAt: new Date() },
    { upsert: true }
  );
  // Odśwież cache
  clearCache(CACHE_KEY);
}

exports.getStats = async (req, res) => {
  // Najpierw sprawdź cache
  const cached = getCache(CACHE_KEY);
  if (cached) return res.json(cached);

  // Jeśli nie ma w cache, pobierz z bazy
  const stats = await Stats.findOne({});
  setCache(CACHE_KEY, stats || { totalQuestions: 0, categories: [] });
  res.json(stats || { totalQuestions: 0, categories: [] });
};

exports.getQuestionsByCategory = async (req, res) => {
  try {
    // Dekoduj kategorię z URL
    const category = decodeURIComponent(req.params.category);
    // Jeśli chcesz pobrać wszystkie, gdy category = 'all'
    const filter = category === "all" ? {} : { category };
    const questions = await Question.find(filter).sort({ ID: 1 });
    res.json(questions);
  } catch (e) {
    res.status(500).json({ message: "Error fetching questions by category" });
  }
};
