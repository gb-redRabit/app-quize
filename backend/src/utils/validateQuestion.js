const LIMITS = {
  question: 5000,
  answer: 2000,
  category: 200,
  description: 2000,
  note: 1000,
};

function cleanText(value, max) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

function parseBool(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

/**
 * Waliduje i normalizuje payload pytania (bez ID).
 * @returns {{ errors: string[], value: object|null }}
 */
function validateQuestionPayload(body = {}) {
  const errors = [];
  const question = cleanText(body.question, LIMITS.question);
  const category = cleanText(body.category, LIMITS.category);
  const description = cleanText(body.description, LIMITS.description);
  const note = cleanText(body.note, LIMITS.note);

  if (!question) errors.push("Treść pytania jest wymagana");
  if (!category) errors.push("Kategoria jest wymagana");

  const answers = {};
  for (const key of ["a", "b", "c"]) {
    const source = body[`answer_${key}`];
    const text = cleanText(source?.answer, LIMITS.answer);
    if (!text) errors.push(`Odpowiedź ${key.toUpperCase()} jest wymagana`);
    answers[key] = {
      answer: text,
      isCorret: parseBool(source?.isCorret ?? source?.isCorrect),
    };
  }

  const correctCount = Object.values(answers).filter((a) => a.isCorret).length;
  if (correctCount !== 1) {
    errors.push("Dokładnie jedna odpowiedź musi być poprawna");
  }

  if (errors.length) return { errors, value: null };

  return {
    errors: [],
    value: {
      question,
      answer_a: answers.a,
      answer_b: answers.b,
      answer_c: answers.c,
      category,
      description,
      flagged: parseBool(body.flagged),
      bad: parseBool(body.bad),
      unknown: parseBool(body.unknown),
      note,
    },
  };
}

module.exports = { validateQuestionPayload };
