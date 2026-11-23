const ExcelJS = require("exceljs");
const { Readable } = require("stream");

const BATCH_SIZE = 500;
const MAX_ERRORS = 10;

function normalizeHeader(value) {
  return String(value || "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const ALIASES = {
  question: ["question", "pytanie", "tresc pytania", "tresc"],
  answer_a: ["answer_a", "odpowiedz a", "odpowiedz_a", "a"],
  answer_b: ["answer_b", "odpowiedz b", "odpowiedz_b", "b"],
  answer_c: ["answer_c", "odpowiedz c", "odpowiedz_c", "c"],
  category: ["category", "kategoria", "nr pytania"],
  description: ["description", "opis", "podstawa prawna", "podstawa"],
  letter: [
    "odpowiedz",
    "prawidlowa odpowiedz",
    "incorect",
    "incorrect",
    "correct",
    "poprawna",
  ],
  correct_a: ["poprawna a", "correct a", "is_correct_a", "is_corret_a", "iscorret_a"],
  correct_b: ["poprawna b", "correct b", "is_correct_b", "is_corret_b", "iscorret_b"],
  correct_c: ["poprawna c", "correct c", "is_correct_c", "is_corret_c", "iscorret_c"],
};

function detectColumns(headerRow) {
  const byName = new Map();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    byName.set(normalizeHeader(cell.text), colNumber);
  });

  const cols = {};
  for (const [key, aliases] of Object.entries(ALIASES)) {
    for (const alias of aliases) {
      if (byName.has(alias)) {
        cols[key] = byName.get(alias);
        break;
      }
    }
  }

  if (!cols.question || !cols.answer_a || !cols.answer_b || !cols.answer_c) {
    return null;
  }
  if (!cols.letter && !cols.correct_a && !cols.correct_b && !cols.correct_c) {
    return null;
  }
  return cols;
}

function cellText(row, columnNumber) {
  if (!columnNumber) return "";
  const cell = row.getCell(columnNumber);
  const text = typeof cell.text === "string" ? cell.text : String(cell.value ?? "");
  return text.replace(/\u0000/g, "").trim();
}

function parseBoolean(value) {
  const normalized = normalizeHeader(value);
  return ["true", "1", "tak", "prawda", "x", "yes"].includes(normalized);
}

function normalizeString(value, maxLength) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return maxLength ? text.slice(0, maxLength) : text;
}

function answersFromFlags(row, cols) {
  const flags = {
    a: cols.correct_a ? parseBoolean(cellText(row, cols.correct_a)) : false,
    b: cols.correct_b ? parseBoolean(cellText(row, cols.correct_b)) : false,
    c: cols.correct_c ? parseBoolean(cellText(row, cols.correct_c)) : false,
  };
  const count = Number(flags.a) + Number(flags.b) + Number(flags.c);
  return count === 1 ? flags : null;
}

function answersFromLetter(row, cols) {
  const letter = cellText(row, cols.letter).toUpperCase().charAt(0);
  if (!["A", "B", "C"].includes(letter)) return null;
  return {
    a: letter === "A",
    b: letter === "B",
    c: letter === "C",
  };
}

/**
 * Streamuje XLSX i zwraca podsumowanie importu.
 * @param {Buffer} buffer
 * @param {{ onBatch: (docs: object[]) => Promise<void>, startId?: number }} options
 */
async function parseWorkbook(buffer, { onBatch, startId = 1 }) {
  const startedAt = Date.now();
  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(Readable.from(buffer), {
    worksheets: "emit",
    sharedStrings: "cache",
    styles: "ignore",
    hyperlinks: "ignore",
  });

  let nextId = startId;
  let added = 0;
  let skipped = 0;
  let sheetIndex = 0;
  const sheets = [];
  const errors = [];
  let batch = [];

  const flush = async () => {
    if (!batch.length) return;
    await onBatch(batch);
    added += batch.length;
    batch = [];
  };

  const recordError = (sheet, rowNumber, reason, question) => {
    if (errors.length >= MAX_ERRORS) return;
    errors.push({ sheet, row: rowNumber, reason, question: String(question || "").slice(0, 120) });
  };

  for await (const worksheet of workbook) {
    sheetIndex += 1;
    const sheetName = worksheet.name || `Sheet${sheetIndex}`;
    const current = { name: sheetName, rows: 0, added: 0, skipped: 0 };
    sheets.push(current);

    let cols = null;
    let headerSeen = false;

    for await (const row of worksheet) {
      if (!headerSeen) {
        headerSeen = true;
        cols = detectColumns(row);
        if (!cols) break;
        continue;
      }

      current.rows += 1;

      const question = normalizeString(cellText(row, cols.question), 5000);
      const answerA = normalizeString(cellText(row, cols.answer_a), 2000);
      const answerB = normalizeString(cellText(row, cols.answer_b), 2000);
      const answerC = normalizeString(cellText(row, cols.answer_c), 2000);

      if (!question || !answerA || !answerB || !answerC) {
        skipped += 1;
        current.skipped += 1;
        continue;
      }

      const correct = cols.letter
        ? answersFromLetter(row, cols)
        : answersFromFlags(row, cols);

      if (!correct) {
        skipped += 1;
        current.skipped += 1;
        recordError(sheetName, row.number, "Brak jednoznacznej poprawnej odpowiedzi", question);
        continue;
      }

      const category =
        normalizeString(cellText(row, cols.category), 200) || normalizeString(sheetName, 200);
      const description = normalizeString(cellText(row, cols.description), 2000);

      batch.push({
        ID: nextId++,
        question,
        answer_a: { answer: answerA, isCorret: correct.a },
        answer_b: { answer: answerB, isCorret: correct.b },
        answer_c: { answer: answerC, isCorret: correct.c },
        category,
        description,
        flagged: false,
        bad: false,
        unknown: false,
        note: "",
      });
      current.added += 1;

      if (batch.length >= BATCH_SIZE) {
        await flush();
      }
    }

    if (!cols) {
      current.skipped += current.rows;
    }
  }

  await flush();

  return {
    added,
    skipped,
    sheets,
    errors,
    durationMs: Date.now() - startedAt,
  };
}

module.exports = { parseWorkbook };
