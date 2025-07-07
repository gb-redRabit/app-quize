const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt"); // DODAJ TO
const usersFilePath = path.join(__dirname, "../../data/users.json");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Register a new user
exports.register = async (req, res) => {
  const { login, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      id: Date.now(),
      login,
      avatar: 0,
      avatarColors: 0,
      password: hashedPassword, // zapisujemy hash
      option: "light",
      history: [],
    };

    fs.readFile(usersFilePath, "utf8", (err, data) => {
      if (err)
        return res.status(500).json({ message: "Error reading users file" });

      const users = JSON.parse(data);
      if (users.find((u) => u.login === login)) {
        return res.status(409).json({ message: "Login already exists" });
      }
      users.push(newUser);

      fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Error writing to users file" });
        res.status(201).json({ message: "User registered successfully" });
      });
    });
  } catch (e) {
    res.status(500).json({ message: "Error hashing password" });
  }
};

// Login user
exports.login = async (req, res) => {
  const { login, password } = req.body;
  fs.readFile(usersFilePath, "utf8", async (err, data) => {
    if (err)
      return res.status(500).json({ message: "Error reading users file" });

    const users = JSON.parse(data);
    const user = users.find((u) => u.login === login);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Sprawdź hash hasła
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    // Zwróć token i dane użytkownika (bez hasła!)
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  });
};

// Logout user
exports.logout = (req, res) => {
  res.status(200).json({ message: "User logged out successfully" });
};
