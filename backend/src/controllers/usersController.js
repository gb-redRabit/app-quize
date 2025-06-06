const fileUtils = require("../utils/fileUtils");

// Get user history
exports.getUserHistory = (req, res) => {
  const userId = req.user.id;
  fileUtils
    .getUsers()
    .then((users) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        res.status(200).json(user.history);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error reading user data", error: err });
    });
};

// Update user history
exports.updateUserHistory = (req, res) => {
  const userId = req.user.id;
  const newHistoryEntry = req.body;
  console.log(
    "Aktualizacja historii dla userId:",
    userId,
    "entry:",
    newHistoryEntry
  );

  fileUtils
    .getUsers()
    .then((users) => {
      const userIndex = users.findIndex((u) => u.id === userId);
      console.log("Znaleziony userIndex:", userIndex);
      if (userIndex !== -1) {
        users[userIndex].history.push(newHistoryEntry);
        return fileUtils.saveUsers(users);
      } else {
        throw new Error("User not found");
      }
    })
    .then(() => {
      res.status(200).json({ message: "User history updated successfully" });
    })
    .catch((err) => {
      console.error("Błąd updateUserHistory:", err);
      res
        .status(500)
        .json({ message: "Error updating user history", error: err });
    });
};
