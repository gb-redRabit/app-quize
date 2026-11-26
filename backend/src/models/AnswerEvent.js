const mongoose = require("mongoose");

/**
 * Odpowiedzi na pytania (dotychczas `User.hquestion`). Nowe wpisy trafiają tutaj,
 * dzięki czemu dokument użytkownika nie rośnie przy każdym pytaniu.
 * Stare wpisy pozostają w `User.hquestion` (legacy) i są scalane przy odczycie.
 */
const answerEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: { type: Number, required: true },
    correct: { type: Boolean, required: true },
    category: { type: String, required: true },
  },
  { collection: "answer_events", versionKey: false }
);

answerEventSchema.index({ userId: 1, questionId: 1 }, { unique: true });
answerEventSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("AnswerEvent", answerEventSchema);
