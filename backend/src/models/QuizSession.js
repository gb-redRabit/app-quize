const mongoose = require("mongoose");

/**
 * Zakończone quizy/egzaminy (dotychczas `User.history`). Nowe sesje trafiają
 * do osobnej kolekcji, żeby dokument użytkownika nie rósł. Stare wpisy
 * pozostają w `User.history` i są scalane przy odczycie.
 */
const quizSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: { type: String, default: null },
    type: { type: String, default: "" },
    category: { type: String, default: "" },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    data: { type: String, default: "" },
    time: { type: Number, default: null },
    questionTimes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    list: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { collection: "quiz_sessions", versionKey: false, timestamps: true }
);

quizSessionSchema.index(
  { userId: 1, clientId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientId: { $type: "string" } },
  }
);
quizSessionSchema.index({ userId: 1, data: 1 });
quizSessionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("QuizSession", quizSessionSchema);
