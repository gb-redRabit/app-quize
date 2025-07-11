const fileUtils = require("../utils/fileUtils");
const fs = require("fs");
const path = require("path");

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await fileUtils.getQuestions();
    res.json(Array.isArray(questions) ? questions : []);
  } catch (e) {
    console.error("Błąd pobierania pytań:", e);
    res.status(500).json({ error: "Błąd pobierania pytań" });
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

exports.deleteQuestion = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const filePath = path.join(__dirname, "../../data/data.json");

  try {
    // Wczytaj aktualne pytania z pliku
    const questions = await fileUtils.readJson(filePath);

    const index = questions.findIndex((q) => q.ID === id);
    if (index === -1) {
      return res.status(404).json({ message: "Question not found" });
    }

    questions.splice(index, 1);

    // Zapisz zaktualizowaną listę
    await fileUtils.writeJson(filePath, questions);

    res.json({ message: "Usunięto pytanie" });
  } catch (err) {
    console.error("Błąd usuwania pytania:", err);
    res.status(500).json({ message: "Błąd usuwania pytania" });
  }
};
const safeWriteUsers = (users, res, successMsg) => {
  // Walidacja: users musi być tablicą i mieć przynajmniej jednego użytkownika
  if (!Array.isArray(users)) {
    return res.status(500).json({ message: "Błąd: users nie jest tablicą!" });
  }
  // Zapisz bezpiecznie
  fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
    if (err) return res.status(500).json({ message: "Błąd zapisu" });
    res.json({ message: successMsg });
  });
};
