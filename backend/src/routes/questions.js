const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const questionsController = require("../controllers/questionsController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

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
router.get("/category/:category", (req, res) => {
  const { category } = req.params;
  require("../controllers/questionsController").getQuestionsByCategory(
    req,
    res
  );
});

module.exports = router;
