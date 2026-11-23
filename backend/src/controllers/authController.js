const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const LOGIN_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;
const MIN_PASSWORD_LENGTH = 8;

// Rejestracja
exports.register = async (req, res) => {
  const { login, password, inviteCode } = req.body || {};

  const requiredInvite = process.env.REGISTRATION_INVITE_CODE;
  if (requiredInvite && inviteCode !== requiredInvite) {
    return res.status(403).json({ message: "Invalid invitation code" });
  }

  if (typeof login !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Login and password are required" });
  }
  if (!LOGIN_PATTERN.test(login)) {
    return res.status(400).json({
      message:
        "Login must be 3-32 characters: letters, digits, dot, underscore or dash",
    });
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 72) {
    return res
      .status(400)
      .json({ message: "Password must be 8-72 characters long" });
  }

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
  const { login, password } = req.body || {};
  if (typeof login !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Login and password are required" });
  }
  try {
    const user = await User.findOne({ login });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
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
