const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimit");
const {
  getSessionVersion,
  bumpSessionVersion,
} = require("../utils/sessionVersion");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Brak JWT_SECRET w zmiennych środowiskowych");
}

// User registration route
router.post("/register", registerLimiter, authController.register);

// User login route
router.post("/login", loginLimiter, authController.login);

// User logout route
router.post("/logout", authController.logout);

// Token refresh route
router.post("/refresh", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const currentVersion = await getSessionVersion(payload.id);
    if (currentVersion === null || (payload.ver || 0) !== currentVersion) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Nowy token z tym samym (domyślnie 7-dniowym) czasem życia.
    const newToken = jwt.sign(
      { id: payload.id, ver: currentVersion },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({ token: newToken });
  } catch (err) {
    console.error("Błąd odświeżania tokenu:", err);
    res.status(500).json({ message: "Błąd odświeżania sesji" });
  }
});

// Unieważnia wszystkie sesje użytkownika (także tę, która wysłała żądanie).
router.post("/logout-all", auth.verifyToken, async (req, res) => {
  try {
    const tokenVersion = await bumpSessionVersion(req.user.id);
    if (tokenVersion === null) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Błąd wylogowywania wszystkich sesji:", err);
    res.status(500).json({ message: "Błąd wylogowywania sesji" });
  }
});

module.exports = router;
