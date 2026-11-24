const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const jwt = require("jsonwebtoken");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimit");

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
router.post("/refresh", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    // Generate a new token for the next hour
    const newToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token: newToken });
  });
});

module.exports = router;
