const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const questionsController = require("../controllers/questionsController");

// Endpoint do pobrania statystyk
router.get("/", auth.verifyToken, questionsController.getStats);

// Endpoint do ręcznej aktualizacji statystyk

module.exports = router;
