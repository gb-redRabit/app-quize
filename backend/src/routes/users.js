const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const usersController = require("../controllers/usersController");
const User = require("../models/User");

// Tylko dla admina!
router.get(
  "/all",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const users = await User.find(
        {},
        "login avatar avatarColors rola option hiddenCategory"
      ); // tylko potrzebne pola (bez historii i hquestion)
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Błąd pobierania użytkowników" });
    }
  }
);
// Historia użytkownika
router.get(
  "/history",
  authMiddleware.verifyToken,
  usersController.getUserHistory
);

// Aktualizacja profilu
router.put(
  "/update-profile",
  authMiddleware.verifyToken,
  usersController.updateProfile
);

// Pobierz dane zalogowanego użytkownika
router.get("/me", authMiddleware.verifyToken, usersController.getMe);

// Pobierz hquestion użytkownika
router.get(
  "/hquestion",
  authMiddleware.verifyToken,
  usersController.getHQuestion
);

// Aktualizuj hquestion użytkownika
router.post(
  "/hquestion",
  authMiddleware.verifyToken,
  usersController.updateHQuestion
);

// Wyczyść hquestion z danej kategorii
router.put(
  "/clear-category",
  authMiddleware.verifyToken,
  usersController.clearCategoryHQuestion
);

router.put(
  "/:id/role",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    const { rola } = req.body;

    if (!["user", "admin"].includes(rola)) {
      return res.status(400).json({ message: "Nieprawidłowa rola" });
    }

    if (String(req.params.id) === String(req.user.id) && rola !== "admin") {
      return res
        .status(400)
        .json({ message: "Nie można odebrać roli administratora sobie" });
    }

    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { rola },
        { new: true, select: "login rola avatar avatarColors option" }
      );
      if (!user)
        return res.status(404).json({ message: "Użytkownik nie znaleziony" });
      res.json({ message: "Rola zaktualizowana", user });
    } catch (err) {
      res.status(500).json({ message: "Błąd aktualizacji roli" });
    }
  }
);

module.exports = router;
