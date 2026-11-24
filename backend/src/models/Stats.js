const mongoose = require("mongoose");

const categoryStatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const statsSchema = new mongoose.Schema({
  totalQuestions: { type: Number, default: 0 },
  categories: { type: [categoryStatSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

// Statystyki są przeliczane przy starcie i po każdej zmianie pytań
// (questionsController.updateStats) — model nie uruchamia własnego timera.
module.exports = mongoose.model("Stats", statsSchema);
