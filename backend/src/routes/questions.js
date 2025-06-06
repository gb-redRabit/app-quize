const express = require("express");
const router = express.Router();
const questionsController = require("../controllers/questionsController");
const authMiddleware = require("../middleware/authMiddleware");

// Route to get all questions
router.get("/", questionsController.getAllQuestions);

// Route to add a new question
router.post("/", authMiddleware.verifyToken, questionsController.addQuestion);

// Route to edit an existing question
router.put(
  "/:id",
  authMiddleware.verifyToken,
  questionsController.updateQuestion // <- poprawna nazwa funkcji
);

// Route to delete a question
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  questionsController.deleteQuestion
);

module.exports = router;
