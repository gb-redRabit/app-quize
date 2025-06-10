const fileUtils = require("../utils/fileUtils");
const fs = require("fs");
const path = require("path");

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await fileUtils.getQuestions();
    res.json(questions);
  } catch (e) {
    res.status(500).json({ error: "Błąd odczytu pytań" });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const questions = await fileUtils.getQuestions();
    const newQuestion = req.body;
    const maxId = questions.reduce((max, q) => Math.max(max, q.ID || 0), 0);
    newQuestion.ID = maxId + 1;
    questions.push(newQuestion);
    await fileUtils.saveQuestions(questions);
    res.status(201).json(newQuestion);
  } catch (e) {
    res.status(500).json({ error: "Błąd dodawania pytania" });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const questions = await fileUtils.getQuestions();
    const { id } = req.params;
    const index = questions.findIndex((q) => q.ID === parseInt(id));
    if (index !== -1) {
      questions[index] = { ...questions[index], ...req.body };
      await fileUtils.saveQuestions(questions);
      res.json(questions[index]);
    } else {
      res.status(404).json({ error: "Question not found" });
    }
  } catch (e) {
    res.status(500).json({ error: "Błąd edycji pytania" });
  }
};

exports.deleteQuestion = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const filePath = path.join(__dirname, "../../data/data.json");
  let questions = require(filePath);

  const index = questions.findIndex((q) => q.ID === id);
  if (index === -1) {
    return res.status(404).json({ message: "Question not found" });
  }

  questions.splice(index, 1);

  fs.writeFile(filePath, JSON.stringify(questions, null, 2), (err) => {
    if (err) {
      console.error("Błąd zapisu pliku data.json:", err);
      return res.status(500).json({ message: "Błąd zapisu pliku" });
    }
    res.json({ message: "Usunięto pytanie" });
  });
};
