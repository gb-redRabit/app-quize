const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const questionsController = require("../controllers/questionsController");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isXlsx = /\.xlsx$/i.test(file.originalname || "");
    if (!isXlsx) {
      return cb(new Error("Dozwolone są tylko pliki .xlsx"));
    }
    cb(null, true);
  },
});

const uploadExcel = upload.single("file");
function uploadExcelMiddleware(req, res, next) {
  uploadExcel(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Plik jest za duży (maksymalnie 25 MB)"
        : err.message || "Błąd uploadu pliku";
    return res.status(400).json({ message });
  });
}
const Question = require("../models/Question");
const QuestionChange = require("../models/QuestionChange");
const events = require("../utils/events");
const {
  bumpQuestionsVersion,
  getQuestionsVersion,
} = require("../utils/questionsVersion");
const { logQuestionBulkChange } = require("../utils/questionChanges");

// Pobierz wszystkie pytania
router.get("/", auth.verifyToken, async (req, res) => {
  if (req.query.ids) {
    try {
      const rawIds = String(req.query.ids)
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      if (rawIds.length === 0 || rawIds.length > 1000) {
        return res.status(400).json({ message: "Nieprawidłowa lista ID" });
      }

      const ids = rawIds.map((id) => Number(id));
      if (ids.some((id) => !Number.isSafeInteger(id) || id < 0)) {
        return res.status(400).json({ message: "Nieprawidłowa lista ID" });
      }

      const questions = await Question.find({ ID: { $in: ids } }).sort({ ID: 1 });
      return res.json({ questions });
    } catch (err) {
      console.error("Błąd pobierania pytań po ID:", err);
      return res.status(500).json({ message: "Błąd pobierania pytań" });
    }
  } else {
    // Przekieruj do kontrolera getAllQuestions dla standardowej paginacji
    return questionsController.getAllQuestions(req, res);
  }
});

// Pobierz wszystkie pytania BEZ paginacji
router.get("/all", auth.verifyToken, auth.requireAdmin, async (req, res) => {
  try {
    // Do grupowania wystarczy treść pytania — pełne dokumenty pobieramy
    // tylko dla faktycznych duplikatów (oszczędza pamięć i transfer).
    const normalize = (q) =>
      (q || "")
        .replace(/[.?!\s]+$/g, "")
        .trim()
        .toLowerCase();

    const meta = await Question.find({}, { ID: 1, question: 1 }).lean();
    const groups = new Map();
    for (const q of meta) {
      const key = normalize(q.question);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(q);
    }

    const duplicateGroups = [...groups.values()].filter((arr) => arr.length > 1);
    if (duplicateGroups.length === 0) {
      return res.json({ duplicates: [] });
    }

    const ids = duplicateGroups.flatMap((arr) => arr.map((q) => q.ID));
    const full = await Question.find({ ID: { $in: ids } }).lean();
    const byId = new Map(full.map((q) => [q.ID, q]));

    const duplicates = duplicateGroups.map((arr) =>
      arr.map((q) => byId.get(q.ID) || q)
    );
    res.json({ duplicates });
  } catch (e) {
    console.error("Błąd pobierania duplikatów pytań:", e);
    res.status(500).json({ message: "Błąd pobierania duplikatów pytań" });
  }
});

// Dodaj nowe pytanie (admin)
router.post("/", auth.verifyToken, auth.requireAdmin, questionsController.addQuestion);

// Edytuj pytanie (admin)
router.put(
  "/:id",
  auth.verifyToken,
  auth.requireAdmin,
  questionsController.updateQuestion
);

// Usuń pytanie (admin)
router.delete(
  "/:id",
  auth.verifyToken,
  auth.requireAdmin,
  questionsController.deleteQuestion
);

// Eksportuj pytania do Excela (admin)
router.get(
  "/export/excel",
  auth.verifyToken,
  auth.requireAdmin,
  questionsController.exportQuestionsToExcel
);

// Wyczyść pytania (admin)
router.post(
  "/clear",
  auth.verifyToken,
  auth.requireAdmin,
  questionsController.clearQuestions
);

// Importuj pytania z Excela (admin)
router.post(
  "/import/excel",
  auth.verifyToken,
  auth.requireAdmin,
  uploadExcelMiddleware,
  questionsController.importQuestionsFromExcel
);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// Wersja bazy pytań (publiczna) — używana przez PWA i stopkę wersji.
router.get("/version", questionsController.getQuestionsVersionInfo);

// Pełny snapshot do lokalnego cache (wymaga zalogowania).
router.get("/snapshot", auth.verifyToken, questionsController.getQuestionsSnapshot);

// Zmiany od podanej wersji — klienci PWA pobierają deltę zamiast pełnego snapshotu.
router.get("/changes", auth.verifyToken, async (req, res) => {
  try {
    const since = Number(req.query.since);
    if (!Number.isSafeInteger(since) || since < 0) {
      return res.status(400).json({ message: "Nieprawidłowy parametr since" });
    }

    const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit, 10) || 500));
    const { version: currentVersion, updatedAt } = await getQuestionsVersion();

    if (since >= currentVersion) {
      return res.json({
        version: currentVersion,
        updatedAt,
        full: false,
        changes: [],
        hasMore: false,
        lastVersion: currentVersion,
      });
    }

    const oldest = await QuestionChange.findOne()
      .sort({ version: 1 })
      .select("version")
      .lean();

    // Brak logów lub luka (wpisy wygasły) — wymuś pełny snapshot.
    if (!oldest || since < oldest.version - 1) {
      return res.json({
        version: currentVersion,
        updatedAt,
        full: true,
        changes: [],
        hasMore: false,
        lastVersion: currentVersion,
      });
    }

    const rows = await QuestionChange.find({ version: { $gt: since } })
      .sort({ version: 1 })
      .limit(limit)
      .lean();

    if (rows.some((row) => row.action === "bulk")) {
      return res.json({
        version: currentVersion,
        updatedAt,
        full: true,
        changes: [],
        hasMore: false,
        lastVersion: currentVersion,
      });
    }

    // Kilka zmian tego samego pytania w zakresie — liczy się ostatnia.
    const latestById = new Map();
    for (const row of rows) {
      if (row.ID == null) continue;
      latestById.set(row.ID, row);
    }

    const upsertIds = [...latestById.values()]
      .filter((row) => row.action === "upsert")
      .map((row) => row.ID);

    const questions =
      upsertIds.length > 0
        ? await Question.find(
            { ID: { $in: upsertIds } },
            { _id: 0, __v: 0 }
          ).lean()
        : [];
    const byId = new Map(questions.map((question) => [question.ID, question]));

    const changes = [];
    for (const row of latestById.values()) {
      if (row.action === "delete") {
        changes.push({ action: "delete", ID: row.ID });
      } else if (row.action === "upsert" && byId.has(row.ID)) {
        changes.push({ action: "upsert", ID: row.ID, question: byId.get(row.ID) });
      }
    }

    const lastVersion = rows.length > 0 ? rows[rows.length - 1].version : since;
    const hasMore = rows.length === limit && lastVersion < currentVersion;

    res.json({
      version: currentVersion,
      updatedAt,
      full: false,
      changes,
      hasMore,
      lastVersion: hasMore ? lastVersion : currentVersion,
    });
  } catch (e) {
    console.error("Błąd pobierania zmian pytań:", e);
    res.status(500).json({ message: "Błąd pobierania zmian pytań" });
  }
});

// Pobierz pytania według kategorii
router.get(
  "/category/:category(*)",
  auth.verifyToken,
  questionsController.getQuestionsByCategory
);
router.get("/search", auth.verifyToken, async (req, res) => {
  try {
    const query = req.query.query?.trim();
    if (!query) return res.json({ questions: [] });

    let filter = {};
    if (/^\d+$/.test(query)) {
      filter = { ID: Number(query) };
    } else {
      filter = { question: { $regex: escapeRegex(query), $options: "i" } };
    }
    const questions = await Question.find(filter).sort({ ID: 1 }).limit(100); // limit dla bezpieczeństwa
    res.json({ questions });
  } catch (err) {
    console.error("Błąd wyszukiwania pytań:", err);
    res.status(500).json({ message: "Błąd wyszukiwania pytań" });
  }
});
// Usuń pytania według kategorii (admin)
router.delete(
  "/category/:category(*)",
  auth.verifyToken,
  auth.requireAdmin,
  async (req, res) => {
    try {
      const category = decodeURIComponent(req.params.category);
      const result = await Question.deleteMany({ category });
      questionsController.invalidateCategoryCache();
      await questionsController.refreshStats();
      const { version } = await bumpQuestionsVersion();
      await logQuestionBulkChange(version, "delete-category");
      events.emit("questions-changed", {
        type: "bulk",
        action: "delete-category",
        category,
        version,
      });
      res.json({ success: true, deletedCount: result.deletedCount });
    } catch (e) {
      console.error("Błąd podczas usuwania pytań:", e);
      res.status(500).json({ message: "Błąd usuwania pytań z kategorii" });
    }
  }
);

module.exports = router;
