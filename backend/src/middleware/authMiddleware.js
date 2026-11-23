const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyToken = (req, res, next) => {
  if (!JWT_SECRET) {
    console.error("Brak JWT_SECRET w zmiennych środowiskowych");
    return res.status(500).json({ message: "Server configuration error" });
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Wymaga zalogowanego użytkownika z rolą "admin" (rola czytana z bazy, nie z tokenu).
exports.requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("rola");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.rola !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.error("Błąd weryfikacji roli:", err);
    res.status(500).json({ message: "Błąd weryfikacji uprawnień" });
  }
};
