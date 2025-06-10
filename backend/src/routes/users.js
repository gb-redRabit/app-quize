const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/history",
  authMiddleware.verifyToken,
  usersController.getUserHistory
);
router.put(
  "/update",
  authMiddleware.verifyToken,
  usersController.updateUserHistory
);

// Zwróć wszystkich użytkowników (np. tylko dla admina)
router.get("/", async (req, res) => {
  try {
    const users = await require("../utils/fileUtils").getUsers();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Błąd odczytu pliku users.json" });
  }
});

module.exports = router;
