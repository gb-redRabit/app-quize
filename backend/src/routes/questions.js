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
const events = require("../utils/events");

// Pobierz wszystkie pytania
router.get("/", auth.verifyToken, async (req, res) => {
  if (req.query.ids) {
    const ids = req.query.ids.split(",").map((id) => Number(id));
    const questions = await Question.find({ ID: { $in: ids } }).sort({ ID: 1 });
    return res.json({ questions });
  } else {
    // Przekieruj do kontrolera getAllQuestions dla standardowej paginacji
    return questionsController.getAllQuestions(req, res);
  }
});

// Pobierz wszystkie pytania BEZ paginacji
router.get("/all", auth.verifyToken, auth.requireAdmin, async (req, res) => {
  try {
    // Pobierz wszystkie pytania z pełnymi danymi
    const questions = await Question.find({}).lean();
    // Funkcja do normalizacji pytania
    const normalize = (q) =>
      (q || "")
        .replace(/[.?!\s]+$/g, "")
        .trim()
        .toLowerCase();
    // Grupowanie po oczyszczonym pytaniu
    const map = {};
    for (const q of questions) {
      const key = normalize(q.question);
      if (!map[key]) map[key] = [];
      map[key].push(q);
    }
    // Zwróć tylko te, które mają duplikaty
    const duplicates = Object.values(map).filter((arr) => arr.length > 1);
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
// Pobierz pytania według kategorii
router.get(
  "/category/:category(*)",
  auth.verifyToken,
  questionsController.getQuestionsByCategory
);
router.get("/search", auth.verifyToken, async (req, res) => {
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
});
// Usuń pytania według kategorii (admin)
router.delete(
  "/category/:category",
  auth.verifyToken,
  auth.requireAdmin,
  async (req, res) => {
    try {
      const category = decodeURIComponent(req.params.category);
      const result = await Question.deleteMany({ category });
      questionsController.invalidateCategoryCache();
      await questionsController.refreshStats();
      events.emit("questions-changed", {
        type: "bulk",
        action: "delete-category",
        category,
      });
      res.json({ success: true, deletedCount: result.deletedCount });
    } catch (e) {
      console.error("Błąd podczas usuwania pytań:", e);
      res.status(500).json({ message: "Błąd usuwania pytań z kategorii" });
    }
  }
);

module.exports = router;
