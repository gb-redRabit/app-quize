const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const questionsController = require("../controllers/questionsController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const Question = require("../models/Question");

// Pobierz wszystkie pytania
router.get("/", questionsController.getAllQuestions);

// Dodaj nowe pytanie
router.post("/", auth.verifyToken, questionsController.addQuestion);

// Edytuj pytanie
router.put("/:id", auth.verifyToken, questionsController.updateQuestion);

// Usuń pytanie
router.delete("/:id", auth.verifyToken, questionsController.deleteQuestion);

// Eksportuj pytania do Excela
router.get(
  "/export/excel",
  auth.verifyToken,
  questionsController.exportQuestionsToExcel
);

// Wyczyść pytania
router.post("/clear", auth.verifyToken, questionsController.clearQuestions);

// Importuj pytania z Excela
router.post(
  "/import/excel",
  auth.verifyToken,
  upload.single("file"),
  questionsController.importQuestionsFromExcel
);

// Pobierz pytania według kategorii
router.get(
  "/category/:category(*)",
  questionsController.getQuestionsByCategory
);
router.get("/search", async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) return res.json({ questions: [] });

  let filter = {};
  if (/^\d+$/.test(query)) {
    filter = { ID: Number(query) };
  } else {
    filter = { question: { $regex: query, $options: "i" } };
  }
  const questions = await Question.find(filter).limit(100); // limit dla bezpieczeństwa
  res.json({ questions });
});
// Usuń pytania według kategorii
router.delete("/category/:category", auth.verifyToken, async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const result = await Question.deleteMany({ category });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (e) {
    console.error("Błąd podczas usuwania pytań:", e);
    res.status(500).json({ message: "Błąd usuwania pytań z kategorii" });
  }
});

module.exports = router;
