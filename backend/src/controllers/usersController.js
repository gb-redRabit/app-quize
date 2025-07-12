const bcrypt = require("bcrypt");
const User = require("../models/User");

// Pobierz historię użytkownika
exports.getUserHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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
exports.updateUserHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.history = req.body.history;
    await user.save();
    res.status(200).json({ message: "History updated" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user history", error: err });
  }
};

// Aktualizacja profilu użytkownika
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Obsługa czyszczenia historii
    if (req.body.clearHistory) {
      user.history = [];
      await user.save();
      return res.json({ message: "Historia wyczyszczona" });
    }

    // Zmiana hasła
    if (req.body.changePassword) {
      const match = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!match)
        return res.status(400).json({ message: "Stare hasło nieprawidłowe" });
      user.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    // Aktualizacja avatara, kolorów, opcji
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.avatarColors !== undefined)
      user.avatarColors = req.body.avatarColors;
    if (req.body.option !== undefined) user.option = req.body.option;

    // Dodanie wpisu do historii
    if (req.body.addHistory) {
      if (!Array.isArray(user.history)) user.history = [];
      user.history.push(req.body.addHistory);
    }
    // Dodanie ukrycia Kategori
    if (req.body.hiddenCategory) {
      user.hiddenCategory = req.body.hiddenCategory;
    }
    await user.save();
    const { password, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Błąd podczas aktualizacji profilu:", error);
    res.status(500).json({ message: "Błąd aktualizacji profilu" });
  }
};

// Pobierz dane zalogowanego użytkownika
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user data" });
  }
};

// GET /api/users/hquestion
exports.getHQuestion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.hquestion || []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching hquestion" });
  }
};

// POST /api/users/hquestion
exports.updateHQuestion = async (req, res) => {
  try {
    const { id, correct, category } = req.body;
    if (
      typeof id === "undefined" ||
      typeof correct === "undefined" ||
      typeof category === "undefined"
    ) {
      return res.status(400).json({ message: "Brak id, correct lub category" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

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

    await user.save();
    res.json({ message: "OK" });
  } catch (err) {
    res.status(500).json({ message: "Błąd aktualizacji hquestion" });
  }
};

// PUT /api/users/clear-category
exports.clearCategoryHQuestion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { category } = req.body;
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!category) return res.status(400).json({ message: "Brak kategorii" });

    user.hquestion = (user.hquestion || []).filter(
      (q) => q.category !== category
    );
    await user.save();
    res.json({ message: "Wyczyszczono pytania z tej kategorii" });
  } catch (err) {
    res.status(500).json({ message: "Błąd czyszczenia kategorii" });
  }
};

// Zapisz odpowiedź na pytanie
exports.saveAnswer = async (req, res) => {
  const { questionId, correct, category } = req.body;
  const user = await User.findById(req.user.id);

  // Znajdź wpis w hquestion
  const idx = user.hquestion.findIndex((q) => q.id === questionId);
  if (idx !== -1) {
    // Nadpisz status odpowiedzi
    user.hquestion[idx].correct = correct;
    user.hquestion[idx].category = category;
  } else {
    // Dodaj nową odpowiedź
    user.hquestion.push({ id: questionId, correct, category });
  }
  await user.save();
};
