const bcrypt = require("bcrypt");
const User = require("../models/User");
const events = require("../utils/events");

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const AVATAR_STYLES = 17;
const OPTIONS = new Set(["light", "dark", "system"]);
const MAX_HIDDEN_CATEGORIES = 200;
const MAX_HISTORY_ENTRY_BYTES = 200 * 1000;
const MAX_HISTORY_ITEMS = 2000;

function isValidHistoryEntry(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
  if (entry.list && !Array.isArray(entry.list)) return false;
  if (Array.isArray(entry.list) && entry.list.length > MAX_HISTORY_ITEMS) return false;
  try {
    return JSON.stringify(entry).length <= MAX_HISTORY_ENTRY_BYTES;
  } catch {
    return false;
  }
}

function normalizeHiddenCategories(value) {
  if (!Array.isArray(value)) return null;
  const list = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim().slice(0, 200))
    .filter(Boolean);
  if (list.length > MAX_HIDDEN_CATEGORIES) return null;
  return Array.from(new Set(list));
}

function emitUserUpdate(user) {
  const obj = user.toObject();
  delete obj.password;
  events.emit("user-updated", {
    userId: String(user._id),
    user: {
      login: obj.login,
      rola: obj.rola,
      avatar: obj.avatar,
      avatarColors: obj.avatarColors,
      option: obj.option,
      hiddenCategory: obj.hiddenCategory || [],
    },
  });
}

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
    const history = req.body.history;
    if (!Array.isArray(history) || !history.every(isValidHistoryEntry)) {
      return res.status(400).json({ message: "Invalid history payload" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.history = history;
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
      emitUserUpdate(user);
      return res.json({ message: "Historia wyczyszczona" });
    }

    // Zmiana hasła
    if (req.body.changePassword) {
      const { oldPassword, newPassword } = req.body;
      if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
        return res.status(400).json({ message: "Hasło jest wymagane" });
      }
      if (
        newPassword.length < MIN_PASSWORD_LENGTH ||
        newPassword.length > MAX_PASSWORD_LENGTH
      ) {
        return res.status(400).json({
          message: `Nowe hasło musi mieć ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} znaków`,
        });
      }

      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match)
        return res.status(400).json({ message: "Stare hasło nieprawidłowe" });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Aktualizacja avatara, kolorów, opcji
    if (req.body.avatar !== undefined) {
      const avatar = req.body.avatar;
      if (!Number.isInteger(avatar) || avatar < 0 || avatar >= AVATAR_STYLES) {
        return res.status(400).json({ message: "Nieprawidłowy awatar" });
      }
      user.avatar = avatar;
    }
    if (req.body.avatarColors !== undefined) {
      const color = req.body.avatarColors;
      if (typeof color !== "string" || !HEX_COLOR.test(color)) {
        return res.status(400).json({ message: "Nieprawidłowy kolor awatara" });
      }
      user.avatarColors = color;
    }
    if (req.body.option !== undefined) {
      if (!OPTIONS.has(req.body.option)) {
        return res.status(400).json({ message: "Nieprawidłowy motyw" });
      }
      user.option = req.body.option;
    }

    // Dodanie wpisu do historii
    if (req.body.addHistory) {
      if (!isValidHistoryEntry(req.body.addHistory)) {
        return res.status(400).json({ message: "Invalid history entry" });
      }
      if (!Array.isArray(user.history)) user.history = [];
      const incoming = req.body.addHistory;
      const alreadyStored =
        incoming &&
        incoming.clientId &&
        user.history.some((entry) => entry && entry.clientId === incoming.clientId);

      // Offline-queue może wysłać ten sam wpis drugi raz — pomijamy duplikat.
      if (!alreadyStored) {
        user.history.push(incoming);
      }
    }
    // Dodanie ukrycia Kategori
    if (req.body.hiddenCategory) {
      const hidden = normalizeHiddenCategories(req.body.hiddenCategory);
      if (!hidden) {
        return res.status(400).json({ message: "Nieprawidłowe ukryte kategorie" });
      }
      user.hiddenCategory = hidden;
    }
    await user.save();
    emitUserUpdate(user);
    const responseUser = user.toObject();
    delete responseUser.password;
    delete responseUser.history;
    delete responseUser.hquestion;
    res.json(responseUser);
  } catch (error) {
    console.error("Błąd podczas aktualizacji profilu:", error);
    res.status(500).json({ message: "Błąd aktualizacji profilu" });
  }
};

// Pobierz dane zalogowanego użytkownika
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -history -hquestion");
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!category) {
      return res.status(400).json({ message: "Brak kategorii" });
    }

    // Zapisz liczbę elementów przed i po filtracji dla weryfikacji
    const beforeCount = (user.hquestion || []).length;
    user.hquestion = (user.hquestion || []).filter(
      (q) => q.category !== category
    );
    const afterCount = user.hquestion.length;

    await user.save();
    res.json({
      message: "Wyczyszczono pytania z tej kategorii",
      removed: beforeCount - afterCount,
    });
  } catch (err) {
    console.error("Błąd czyszczenia kategorii:", err);
    res.status(500).json({ message: "Błąd czyszczenia kategorii" });
  }
};


