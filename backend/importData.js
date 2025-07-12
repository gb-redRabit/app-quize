require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Question = require("./src/models/Question");
const User = require("./src/models/User");

const MONGO_URI = process.env.MONGO_URI;

async function importQuestions() {
  const dataPath = path.join(__dirname, "data", "data.json");
  const raw = fs.readFileSync(dataPath, "utf8");
  let questions = JSON.parse(raw);
  questions = questions.filter(
    (q) =>
      q.question &&
      q.answer_a &&
      q.answer_a.answer &&
      q.answer_a.answer.trim() !== "" &&
      q.answer_b &&
      q.answer_b.answer &&
      q.answer_b.answer.trim() !== "" &&
      q.answer_c &&
      q.answer_c.answer &&
      q.answer_c.answer.trim() !== ""
  );
  await Question.deleteMany({});
  await Question.insertMany(questions);
  console.log("Zaimportowano pytania!");
}

async function importUsers() {
  const usersPath = path.join(__dirname, "data", "users.json");
  const raw = fs.readFileSync(usersPath, "utf8");
  const users = JSON.parse(raw);
  await User.deleteMany({});
  await User.insertMany(users);
  console.log("Zaimportowano użytkowników!");
}

async function main() {
  await mongoose.connect(MONGO_URI);
  await importQuestions();
  await importUsers();
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
