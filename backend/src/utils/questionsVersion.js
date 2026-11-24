const Meta = require("../models/Meta");

const QUESTIONS_KEY = "questions";

/**
 * Podbija wersję bazy pytań. Wywoływane po każdej mutacji, żeby klienci PWA
 * wiedzieli, kiedy odświeżyć lokalny cache.
 * @returns {Promise<{ version: number, updatedAt: Date }>}
 */
async function bumpQuestionsVersion() {
  const doc = await Meta.findOneAndUpdate(
    { key: QUESTIONS_KEY },
    { $inc: { version: 1 }, $set: { updatedAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return { version: doc.version, updatedAt: doc.updatedAt };
}

/**
 * Zwraca aktualną wersję bez jej zmiany (tworzy dokument, jeśli brak).
 */
async function getQuestionsVersion() {
  const doc = await Meta.findOne({ key: QUESTIONS_KEY }).lean();
  if (doc) return { version: doc.version, updatedAt: doc.updatedAt };

  const created = await Meta.findOneAndUpdate(
    { key: QUESTIONS_KEY },
    { $setOnInsert: { version: 1, updatedAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return { version: created.version, updatedAt: created.updatedAt };
}

module.exports = { bumpQuestionsVersion, getQuestionsVersion, QUESTIONS_KEY };
