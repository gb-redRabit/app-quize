const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const questionsController = require("../controllers/questionsController");
const multer = require("multer");
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
}); // 10MB
const ExcelJS = require("exceljs");
const fileUtils = require("../utils/fileUtils");
const path = require("path");
const DATA_PATH = path.join(__dirname, "../../data/data.json");

// Pobierz wszystkie pytania
router.get("/", questionsController.getAllQuestions);

// Dodaj nowe pytanie
router.post("/", auth.verifyToken, questionsController.addQuestion);

// Edytuj pytanie
router.put("/:id", auth.verifyToken, questionsController.updateQuestion);

// Usuń pytanie
router.delete("/:id", auth.verifyToken, questionsController.deleteQuestion);

// Import wielu pytań z pliku
router.post("/import", auth.verifyToken, async (req, res) => {
  try {
    let { questions } = req.body;
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: "Brak tablicy pytań" });
    }
    // Wczytaj aktualne pytania
    const allQuestions = await fileUtils.readJson(DATA_PATH);
    let maxId = allQuestions.reduce((max, q) => Math.max(max, q.ID || 0), 0);

    // Przydziel nowe ID i popraw strukturę
    const newQuestions = questions.map((q) => ({
      ...q,
      ID: ++maxId,
    }));

    // Dodaj do bazy
    const updated = [...allQuestions, ...newQuestions];
    await fileUtils.writeJson(DATA_PATH, updated);

    res.json({ added: newQuestions.length });
  } catch (e) {
    console.error("Błąd importu pytań:", e);
    res.status(500).json({ error: "Błąd importu pytań: " + e.message });
  }
});
router.post("/clear", async (req, res) => {
  try {
    await fileUtils.saveQuestions([]);
    res.json({ message: "Baza pytań została wyczyszczona." });
  } catch (e) {
    res.status(500).json({ message: "Błąd czyszczenia bazy pytań." });
  }
});
// Eksport pytań do Excela
router.get("/export/excel", auth.verifyToken, async (req, res) => {
  try {
    const questions = await fileUtils.readJson(DATA_PATH);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Pytania");

    worksheet.columns = [
      { header: "ID", key: "ID", width: 8 },
      { header: "Pytanie", key: "question", width: 60 },
      { header: "Odpowiedź A", key: "answer_a", width: 30 },
      { header: "Poprawna A", key: "isCorret_a", width: 10 },
      { header: "Odpowiedź B", key: "answer_b", width: 30 },
      { header: "Poprawna B", key: "isCorret_b", width: 10 },
      { header: "Odpowiedź C", key: "answer_c", width: 30 },
      { header: "Poprawna C", key: "isCorret_c", width: 10 },
      { header: "Kategoria", key: "category", width: 20 },
      { header: "Opis", key: "description", width: 40 },
    ];

    questions.forEach((q) => {
      worksheet.addRow({
        ID: q.ID,
        question: q.question,
        answer_a: q.answer_a?.answer || "",
        isCorret_a: q.answer_a?.isCorret ? "true" : "false",
        answer_b: q.answer_b?.answer || "",
        isCorret_b: q.answer_b?.isCorret ? "true" : "false",
        answer_c: q.answer_c?.answer || "",
        isCorret_c: q.answer_c?.isCorret ? "true" : "false",
        category: q.category || "",
        description: q.description || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // --- POCZĄTEK KLUCZOWEJ POPRAWKI ---
    // Ustawiamy nagłówki ręcznie i kończymy odpowiedź za pomocą res.end
    res.writeHead(200, {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=pytania.xlsx",
      "Content-Length": buffer.length, // Bardzo ważny nagłówek!
    });

    res.end(buffer); // Używamy res.end() zamiast res.send()
    // --- KONIEC KLUCZOWEJ POPRAWKI ---
  } catch (e) {
    console.error("Błąd eksportu do Excela:", e);
    // Jeśli wystąpi błąd, upewnij się, że wysyłasz odpowiedź JSON
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Błąd serwera podczas eksportu do Excela." });
    }
  }
});

router.post("/clear", auth.verifyToken, async (req, res) => {
  try {
    const { password } = req.body;
    // Pobierz użytkownika z tokena
    const users = await fileUtils.getUsers();
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(403).json({ error: "Brak użytkownika" });
    if (user.password !== password)
      return res.status(401).json({ error: "Nieprawidłowe hasło" });

    // Wyczyść bazę pytań
    await fileUtils.writeJson(DATA_PATH, []);
    res.json({ message: "Baza pytań została wyczyszczona." });
  } catch (e) {
    res.status(500).json({ error: "Błąd czyszczenia bazy: " + e.message });
  }
});

// Import pytań z Excela
router.post(
  "/import/excel",
  auth.verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Brak pliku Excel" });
      }
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.worksheets[0];

      // Pobierz aktualne pytania i max ID
      const allQuestions = await fileUtils.readJson(DATA_PATH);
      let maxId = allQuestions.reduce((max, q) => Math.max(max, q.ID || 0), 0);

      // Odczytaj wiersze z Excela (pomijając nagłówek)
      const newQuestions = [];
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return; // pomiń nagłówek
        const [
          id,
          question,
          answer_a,
          isCorret_a,
          answer_b,
          isCorret_b,
          answer_c,
          isCorret_c,
          category,
          description,
        ] = row.values.slice(1).map((val) => {
          if (val === null || val === undefined) return "";
          if (val instanceof Date) {
            // Zamień datę na oryginalny zapis liczbowy lub tekstowy
            // ExcelJS nie przechowuje oryginalnej postaci, więc zamieniamy na ISO lub liczbowo
            // Najlepiej zamienić na string liczbowy (Excel daty trzyma jako liczby float)
            return val.toISOString();
          }
          return String(val);
        });

        // Zamiana na wartość logiczną
        const toBool = (val) => {
          if (typeof val === "boolean") return val;
          if (typeof val === "number") return val !== 0;
          if (!val) return false;
          const s = val.toString().trim().toLowerCase();
          return ["true", "tak", "yes", "1", "x"].includes(s);
        };

        newQuestions.push({
          ID: ++maxId,
          question: question || "",
          answer_a: {
            answer: answer_a || "",
            isCorret: toBool(isCorret_a),
          },
          answer_b: {
            answer: answer_b || "",
            isCorret: toBool(isCorret_b),
          },
          answer_c: {
            answer: answer_c || "",
            isCorret: toBool(isCorret_c),
          },
          category: category || "",
          description: description || "",
        });
      });

      // Dodaj do bazy
      const updated = [...allQuestions, ...newQuestions];
      await fileUtils.writeJson(DATA_PATH, updated);

      // Usuń plik tymczasowy
      const fs = require("fs");
      fs.unlinkSync(req.file.path);

      res.json({ added: newQuestions.length });
    } catch (e) {
      console.error("Błąd importu pytań z Excela:", e);
      res
        .status(500)
        .json({ error: "Błąd importu pytań z Excela: " + e.message });
    }
  }
);

module.exports = router;
