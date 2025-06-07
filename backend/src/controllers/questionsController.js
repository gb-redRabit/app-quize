const fs = require("fs");
const path = require("path");
const dataFilePath = path.join(__dirname, "../../data/data.json");
const usersFilePath = path.join(__dirname, "../../data/users.json");

const readDataFile = () => {
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
};

const writeDataFile = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

const readUsersFile = () => {
  const data = fs.readFileSync(usersFilePath);
  return JSON.parse(data);
};

const writeUsersFile = (data) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
};

const getAllQuestions = (req, res) => {
  const questions = readDataFile();
  res.json(questions);
};

const addQuestion = (req, res) => {
  const questions = readDataFile();
  const newQuestion = req.body;

  // Znajdź największy istniejący ID
  const maxId = questions
    .filter((q) => q.ID !== undefined)
    .reduce((max, q) => Math.max(max, q.ID), 0);

  newQuestion.ID = maxId + 1;

  questions.push(newQuestion);
  writeDataFile(questions);
  res.status(201).json(newQuestion);
};

const updateQuestion = (req, res) => {
  const questions = readDataFile();
  const { id } = req.params;
  const index = questions.findIndex((q) => q.ID === parseInt(id)); // <--- poprawka
  if (index !== -1) {
    questions[index] = { ...questions[index], ...req.body };
    writeDataFile(questions);
    res.json(questions[index]);
  } else {
    res.status(404).send("Question not found");
  }
};

const deleteQuestion = (req, res) => {
  const questions = readDataFile();
  const { id } = req.params;
  const index = questions.findIndex((q) => q.ID === parseInt(id)); // <--- poprawka
  if (index !== -1) {
    questions.splice(index, 1);
    writeDataFile(questions);
    res.status(200).json({ message: "Question deleted" });
  } else {
    res.status(404).json({ message: "Question not found" });
  }
};

module.exports = {
  getAllQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};
