const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const usersFilePath = path.join(__dirname, "../../data/users.json");

// Register a new user
exports.register = async (req, res) => {
  const { login, password } = req.body;

  // NIE haszuj hasła!
  const newUser = {
    id: Date.now(),
    login,
    password, // zapisujemy jako tekst
    option: "light",
    history: [],
  };

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err)
      return res.status(500).json({ message: "Error reading users file" });

    const users = JSON.parse(data);
    users.push(newUser);

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err)
        return res.status(500).json({ message: "Error writing to users file" });
      res.status(201).json({ message: "User registered successfully" });
    });
  });
};

// Login user
exports.login = async (req, res) => {
  const { login, password } = req.body;

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err)
      return res.status(500).json({ message: "Error reading users file" });

    const users = JSON.parse(data);
    const user = users.find((u) => u.login === login);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (password !== user.password)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, "your_jwt_secret", {
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
