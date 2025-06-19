const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const usersFilePath = path.join(__dirname, "../../data/users.json");
const authMiddleware = require("../middleware/authMiddleware");
const usersController = require("../controllers/usersController");

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

// Dodaj odpowiedź do hquestion
router.post("/hquestion", authMiddleware.verifyToken, (req, res) => {
  const { id, correct, category } = req.body;
  if (
    typeof id === "undefined" ||
    typeof correct === "undefined" ||
    typeof category === "undefined"
  ) {
    return res.status(400).json({ message: "Brak id, correct lub category" });
  }
  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Błąd pliku users" });
    const users = JSON.parse(data);
    const user = users.find((u) => u.id === req.user.id);
    if (!user)
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    if (!Array.isArray(user.hquestion)) user.hquestion = [];

    // Szukaj wpisu po id
    const existing = user.hquestion.find((q) => q.id == id);

    if (existing) {
      if (correct === true) {
        existing.correct = true;
        return safeWriteUsers(users, res, "Poprawiono na poprawną odpowiedź");
      } else if (existing.correct !== true) {
        existing.correct = false;
        return safeWriteUsers(users, res, "Zapisano jako błędną odpowiedź");
      } else {
        return res.json({ message: "Już poprawnie rozwiązane" });
      }
    } else {
      // Nie istnieje – dodaj nowy wpis
      user.hquestion.push({ id, correct, category });
      return safeWriteUsers(users, res, "Dodano do hquestion");
    }
  });
});

router.get("/me", authMiddleware.verifyToken, (req, res) => {
  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Błąd pliku users" });
    const users = JSON.parse(data);
    const user = users.find((u) => u.id === req.user.id);
    if (!user)
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    res.json(user); // user.hquestion jest w tym obiekcie
  });
});

router.get("/hquestion", authMiddleware.verifyToken, (req, res) => {
  const userId = req.user.id;
  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Błąd pliku users" });
    const users = JSON.parse(data);
    const user = users.find((u) => u.id === userId);
    if (!user)
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    res.json(user.hquestion || []);
  });
});

const safeWriteUsers = (users, res, successMsg) => {
  if (!Array.isArray(users)) {
    return res.status(500).json({ message: "Błąd: users nie jest tablicą!" });
  }
  fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
    if (err) return res.status(500).json({ message: "Błąd zapisu" });
    res.json({ message: successMsg });
  });
};

module.exports = router;
