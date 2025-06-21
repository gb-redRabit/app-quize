const fs = require("fs");
const path = require("path");
const fileUtils = require("../utils/fileUtils");
const { writeJsonQueued } = require("../utils/writeQueue");
const usersFilePath = path.join(__dirname, "../../data/users.json");

// Funkcja pomocnicza do bezpiecznego zapisu pliku users.json
const safeWriteUsers = (users, res, successMsg) => {
  if (!Array.isArray(users)) {
    return res.status(500).json({ message: "Błąd: users nie jest tablicą!" });
  }
  writeJsonQueued(usersFilePath, users, (err) => {
    if (err) return res.status(500).json({ message: "Błąd zapisu" });
    res.json({ message: successMsg });
  });
};

// Pobierz historię użytkownika
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await fileUtils.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      res.status(200).json(user.history);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error reading user data", error: err });
  }
};

// Zaktualizuj historię użytkownika
exports.updateUserHistory = (req, res) => {
  const userId = req.user.id;
  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Błąd pliku users" });
    const users = JSON.parse(data);
    const user = users.find((u) => u.id === userId);
    if (!user)
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });

    // Obsługa czyszczenia historii kategorii
    if (req.body.clearCategory) {
      const cat = req.body.clearCategory;
      user.hquestion = (user.hquestion || []).filter((q) => q.category !== cat);
      return safeWriteUsers(users, res, "Historia kategorii wyczyszczona");
    }
    if (req.body.addHistory) {
      user.history = user.history || [];
      user.history.push(req.body.addHistory);
      return safeWriteUsers(users, res, "Historia dodana");
    }

    // ...pozostała obsługa update...
    res.json({ message: "Brak akcji" });
  });
};
