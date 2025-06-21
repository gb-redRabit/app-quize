const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const usersFilePath = path.join(__dirname, "../../data/users.json");
const authMiddleware = require("../middleware/authMiddleware");
const usersController = require("../controllers/usersController");
const { writeJsonQueued } = require("../utils/writeQueue");

router.get(
  "/history",
  authMiddleware.verifyToken,
  usersController.getUserHistory
);
router.put("/update", authMiddleware.verifyToken, (req, res) => {
  usersLock = usersLock.then(
    () =>
      new Promise((resolve) => {
        fs.readFile(usersFilePath, "utf8", (err, data) => {
          if (err) {
            res.status(500).json({ message: "Błąd pliku users" });
            return resolve();
          }
          const users = JSON.parse(data);
          const user = users.find((u) => u.id === req.user.id);
          if (!user) {
            res.status(404).json({ message: "Nie znaleziono użytkownika" });
            return resolve();
          }

          if (req.body.clearHistory) {
            user.history = [];
          }
          if (req.body.addHistory) {
            user.history = user.history || [];
            user.history.push(req.body.addHistory);
          }
          if (req.body.option) {
            user.option = req.body.option;
          }
          if (req.body.changePassword) {
            const bcrypt = require("bcrypt");
            if (!req.body.oldPassword || !req.body.newPassword) {
              res.status(400).json({ message: "Brak hasła" });
              return resolve();
            }
            // Sprawdź stare hasło
            bcrypt.compare(
              req.body.oldPassword,
              user.password,
              async (err, result) => {
                if (!result) {
                  res
                    .status(401)
                    .json({ message: "Stare hasło nieprawidłowe" });
                  return resolve();
                }
                user.password = await bcrypt.hash(req.body.newPassword, 10);
                fs.writeFile(
                  usersFilePath,
                  JSON.stringify(users, null, 2),
                  (err) => {
                    if (err) res.status(500).json({ message: "Błąd zapisu" });
                    else res.json({ message: "Hasło zmienione" });
                    resolve();
                  }
                );
              }
            );
            return; // ważne!
          }
          fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) res.status(500).json({ message: "Błąd zapisu" });
            else res.json({ message: "Zaktualizowano" });
            resolve();
          });
        });
      })
  );
});

// Zwróć wszystkich użytkowników (np. tylko dla admina)
router.get("/", async (req, res) => {
  try {
    const users = await require("../utils/fileUtils").getUsers();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Błąd odczytu pliku users.json" });
  }
});

let usersLock = Promise.resolve();

router.post("/hquestion", authMiddleware.verifyToken, (req, res) => {
  const { id, correct, category } = req.body;
  if (
    typeof id === "undefined" ||
    typeof correct === "undefined" ||
    typeof category === "undefined"
  ) {
    return res.status(400).json({ message: "Brak id, correct lub category" });
  }

  usersLock = usersLock.then(
    () =>
      new Promise((resolve) => {
        fs.readFile(usersFilePath, "utf8", (err, data) => {
          if (err) {
            res.status(500).json({ message: "Błąd pliku users" });
            return resolve();
          }
          const users = JSON.parse(data);
          const user = users.find((u) => u.id === req.user.id);
          if (!user) {
            res.status(404).json({ message: "Nie znaleziono użytkownika" });
            return resolve();
          }
          if (!Array.isArray(user.hquestion)) user.hquestion = [];

          // Szukamy istniejącego wpisu
          const existing = user.hquestion.find((q) => q.id == id);

          if (!existing) {
            user.hquestion.push({ id, correct, category });
          } else if (existing.correct === false && correct === true) {
            existing.correct = true;
            existing.category = category;
          }
          // W innych przypadkach nie zmieniamy wpisu

          fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) res.status(500).json({ message: "Błąd zapisu" });
            else res.json({ message: "OK" });
            resolve();
          });
        });
      })
  );
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

router.put("/clear-category", authMiddleware.verifyToken, (req, res) => {
  const userId = req.user.id;
  const { category } = req.body;
  if (!category) return res.status(400).json({ message: "Brak kategorii" });

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Błąd pliku users" });
    const users = JSON.parse(data);
    const user = users.find((u) => u.id === userId);
    if (!user)
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });

    user.hquestion = (user.hquestion || []).filter(
      (q) => q.category !== category
    );

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Błąd zapisu" });
      res.json({ message: "Wyczyszczono pytania z tej kategorii" });
    });
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
