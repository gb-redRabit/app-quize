const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    answer: { type: String, required: true },
    isCorret: { type: Boolean, required: true },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema({
  ID: Number,
  question: { type: String, required: true },
  answer_a: { type: answerSchema, required: true },
  answer_b: { type: answerSchema, required: true },
  answer_c: { type: answerSchema, required: true },
  category: { type: String },
  description: { type: String },
});

module.exports = mongoose.model("Question", questionSchema);
