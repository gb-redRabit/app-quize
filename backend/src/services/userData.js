const User = require("../models/User");
const AnswerEvent = require("../models/AnswerEvent");
const QuizSession = require("../models/QuizSession");

/** Łączy stare wpisy z dokumentu użytkownika z nowymi w osobnych kolekcjach. */
function sessionToHistory(session) {
  return {
    clientId: session.clientId,
    type: session.type,
    category: session.category,
    correct: session.correct,
    wrong: session.wrong,
    data: session.data,
    time: session.time,
    questionTimes: Array.isArray(session.questionTimes) ? session.questionTimes : [],
    list: Array.isArray(session.list) ? session.list : [],
  };
}

async function getUserHistory(userId) {
  const [user, sessions] = await Promise.all([
    User.findById(userId).select("history").lean(),
    QuizSession.find({ userId }).sort({ createdAt: 1, _id: 1 }).lean(),
  ]);
  const legacy = Array.isArray(user?.history) ? user.history : [];
  const sessionIds = new Set(
    sessions.map((session) => session.clientId).filter(Boolean)
  );
  // Stare wpisy z tym samym clientId mogły zostać wcześniej wysłane ponownie.
  const legacyOnly = legacy.filter(
    (entry) => !entry?.clientId || !sessionIds.has(entry.clientId)
  );
  return [...legacyOnly, ...sessions.map(sessionToHistory)];
}

async function getUserHQuestion(userId) {
  const [user, events] = await Promise.all([
    User.findById(userId).select("hquestion").lean(),
    AnswerEvent.find({ userId }).sort({ _id: 1 }).lean(),
  ]);
  const legacy = Array.isArray(user?.hquestion) ? user.hquestion : [];
  return [
    ...legacy,
    ...events.map((event) => ({
      id: event.questionId,
      correct: event.correct,
      category: event.category,
    })),
  ];
}

/** Nowy wpis historii — idempotentny po `clientId`, bez powiększania User. */
async function addHistoryEntry(userId, entry) {
  const data = { ...entry };
  delete data._id;

  if (typeof data.clientId === "string" && data.clientId) {
    await QuizSession.updateOne(
      { userId, clientId: data.clientId },
      { $setOnInsert: data },
      { upsert: true }
    );
    return;
  }

  await QuizSession.create({ ...data, userId });
}

/**
 * Zapis odpowiedzi: nowe pytania → `answer_events`; pytania obecne w starym
 * `User.hquestion` są aktualizowane w miejscu (bez tworzenia duplikatu).
 * Zwraca `null`, gdy użytkownik nie istnieje.
 */
async function addAnswer(userId, { id, correct, category }) {
  const questionId = Number(id);

  // Trzy niezależne sprawdzenia równolegle: event, wpis legacy, istnienie konta.
  const [event, legacyExists, userExists] = await Promise.all([
    AnswerEvent.findOne({ userId, questionId }),
    User.exists({ _id: userId, "hquestion.id": questionId }),
    User.exists({ _id: userId }),
  ]);

  if (!userExists) return null;

  if (event) {
    if (event.correct === false && correct === true) {
      await AnswerEvent.updateOne(
        { _id: event._id },
        { $set: { correct: true, category } }
      );
    }
    return "event";
  }

  if (legacyExists) {
    await User.updateOne(
      {
        _id: userId,
        "hquestion.id": questionId,
        "hquestion.correct": false,
      },
      {
        $set: {
          "hquestion.$.correct": true,
          "hquestion.$.category": category,
        },
      }
    );
    return "legacy";
  }

  try {
    await AnswerEvent.create({ userId, questionId, correct, category });
  } catch (error) {
    if (error?.code === 11000) {
      await AnswerEvent.updateOne(
        { userId, questionId, correct: false },
        { $set: { correct: true, category } }
      );
      return "event";
    }
    throw error;
  }
  return "event";
}

async function clearHistory(userId) {
  await Promise.all([
    User.updateOne({ _id: userId }, { $set: { history: [] } }),
    QuizSession.deleteMany({ userId }),
  ]);
}

async function clearCategoryAnswers(userId, category) {
  // Atomowo: zdejmij wpisy legacy i skasuj nowe eventy równolegle.
  const [legacyResult, eventsResult] = await Promise.all([
    User.updateOne(
      { _id: userId },
      { $pull: { hquestion: { category } } }
    ),
    AnswerEvent.deleteMany({ userId, category }),
  ]);

  return (
    (legacyResult?.modifiedCount || 0) + (eventsResult?.deletedCount || 0)
  );
}

async function deleteUserData(userId) {
  await Promise.all([
    AnswerEvent.deleteMany({ userId }),
    QuizSession.deleteMany({ userId }),
  ]);
}

module.exports = {
  getUserHistory,
  getUserHQuestion,
  addHistoryEntry,
  addAnswer,
  clearHistory,
  clearCategoryAnswers,
  deleteUserData,
  sessionToHistory,
};
