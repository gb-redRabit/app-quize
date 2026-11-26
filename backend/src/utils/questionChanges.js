const QuestionChange = require("../models/QuestionChange");

/**
 * Zapisuje wpis dziennika zmian. Nigdy nie wywraca mutacji pytania —
 * przy błędzie logowania klienci po prostu dostaną pełny snapshot.
 */
async function logQuestionChange(version, action, ID = null) {
  if (!Number.isFinite(Number(version)) || !action) return;
  try {
    await QuestionChange.create({
      version: Number(version),
      action,
      ID: ID == null ? null : Number(ID),
    });
  } catch (error) {
    console.warn("Nie udało się zapisać zmiany pytania:", error?.message || error);
  }
}

async function logQuestionBulkChange(version, action = "bulk") {
  return logQuestionChange(version, "bulk", null);
}

module.exports = { logQuestionChange, logQuestionBulkChange };
