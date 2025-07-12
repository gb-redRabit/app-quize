const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

// Rejestracja
exports.register = async (req, res) => {
  const { login, password } = req.body;
  try {
    const existing = await User.findOne({ login });
    if (existing) {
      return res.status(409).json({ message: "Login already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ login, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (e) {
    res.status(500).json({ message: "Error registering user" });
  }
};

// Logowanie
exports.login = async (req, res) => {
  const { login, password } = req.body;
  try {
    const user = await User.findOne({ login });
    if (!user) return res.status(404).json({ message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ token, user: userWithoutPassword });
  } catch (e) {
    res.status(500).json({ message: "Login error" });
  }
};

// Wylogowanie (opcjonalnie)
exports.logout = (req, res) => {
  res.status(200).json({ message: "User logged out successfully" });
};
