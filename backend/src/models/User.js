const mongoose = require("mongoose");

const answerHistorySchema = new mongoose.Schema({
  id: { type: Number, required: true }, // ID pytania
  correct: { type: Boolean, required: true },
  category: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rola: { type: String, default: "user" },
  avatar: { type: Number, default: 0 },
  avatarColors: { type: String, default: "#f200f2" },
  option: { type: String, default: "light" },
  history: { type: Array, default: [] },
  hquestion: { type: [answerHistorySchema], default: [] },
  hiddenCategory: { type: [String], default: [] },
  tokenVersion: { type: Number, default: 0 },
  settings: {
    autoNext: { type: Boolean, default: true },
    showDescriptions: { type: Boolean, default: true },
    examLength: { type: Number, default: 150 },
  },
});

module.exports = mongoose.model("User", userSchema);
