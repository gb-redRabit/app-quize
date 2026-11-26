const mongoose = require("mongoose");

/**
 * Dziennik zmian pytań — pozwala klientom PWA pobrać tylko deltę zamiast
 * pełnego snapshotu (~5 MB). Wpisy wygasają po 30 dniach; starsi klienci
 * dostają pełny snapshot.
 */
const questionChangeSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true, index: true },
    action: { type: String, required: true }, // upsert | delete | bulk
    ID: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "question_changes", versionKey: false }
);

questionChangeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model("QuestionChange", questionChangeSchema);
