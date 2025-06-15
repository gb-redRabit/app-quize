const fileUtils = require("../utils/fileUtils");

// Pobierz historię użytkownika
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await fileUtils.getUsers();
    const user = users.find((u) => u.id === userId);
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
    const userId = req.user.id;
    const users = await fileUtils.getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      if (req.body.clearHistory) {
        users[userIndex].history = [];
      } else {
        users[userIndex].history.push(req.body);
      }
      await fileUtils.saveUsers(users);
      res.status(200).json({ message: "User history updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user history", error: err });
  }
};
