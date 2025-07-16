const express = require("express");
const router = express.Router();
const questionsController = require("../controllers/questionsController");

// Endpoint do pobrania statystyk
router.get("/", questionsController.getStats);

// Endpoint do ręcznej aktualizacji statystyk

module.exports = router;
