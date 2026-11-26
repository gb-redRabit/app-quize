const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");

// --- Stuby modeli, żeby testować kontroler bez bazy ---
const userPath = require.resolve("../src/models/User");
const questionPath = require.resolve("../src/models/Question");
const answerEventPath = require.resolve("../src/models/AnswerEvent");
const quizSessionPath = require.resolve("../src/models/QuizSession");
const sessionVersionPath = require.resolve("../src/utils/sessionVersion");

const state = {
  existing: null,
  target: null,
  admins: 1,
  aggregate: [],
  created: null,
  deleted: false,
  saved: null,
  updateOneCalls: [],
  updateOneResults: [],
  userExists: true,
  legacyQuestionExists: false,
  answerEvent: null,
  answerEventCreateCalls: [],
  answerEventDeletedCount: 0,
  invalidateCalls: [],
};

const fakeAnswerEventModel = {
  findOne: async () => state.answerEvent,
  create: async (data) => {
    state.answerEventCreateCalls.push(data);
    return data;
  },
  updateOne: async () => ({ matchedCount: 1 }),
  deleteMany: async () => ({ deletedCount: state.answerEventDeletedCount }),
  aggregate: async () => [],
};

const fakeQuizSessionModel = {
  find: () => ({
    sort: () => ({ lean: async () => [] }),
  }),
  updateOne: async () => ({ matchedCount: 1 }),
  create: async (data) => data,
  deleteMany: async () => ({ deletedCount: 0 }),
  aggregate: async () => [],
};

require.cache[answerEventPath] = {
  id: answerEventPath,
  filename: answerEventPath,
  loaded: true,
  exports: fakeAnswerEventModel,
};
require.cache[quizSessionPath] = {
  id: quizSessionPath,
  filename: quizSessionPath,
  loaded: true,
  exports: fakeQuizSessionModel,
};

const fakeUserModel = {
  findOne: async () => state.existing,
  // Testy potrzebują zarówno `await User.findById()`, jak i `.select()`.
  findById: () => {
    const query = {
      select: async () => state.target,
      then: (resolve) => resolve(state.target),
    };
    return query;
  },
  countDocuments: async () => state.admins,
  create: async (data) => {
    state.created = {
      _id: "new-user-id",
      login: data.login,
      rola: data.rola,
      avatar: 0,
      avatarColors: "#416AFF",
      option: "light",
      hiddenCategory: [],
    };
    return state.created;
  },
  aggregate: async (pipeline = []) => {
    // Statystyki aktywności/kategorii używają $unwind — w testach zwracamy puste.
    if (pipeline.some((stage) => stage && stage.$unwind)) return [];
    return state.aggregate;
  },
  updateOne: async (...args) => {
    state.updateOneCalls.push(args);
    return state.updateOneResults.shift() || { matchedCount: 0, modifiedCount: 0 };
  },
  exists: async (filter = {}) => {
    if (filter && Object.prototype.hasOwnProperty.call(filter, "hquestion.id")) {
      return state.legacyQuestionExists;
    }
    return state.userExists;
  },
};

require.cache[userPath] = {
  id: userPath,
  filename: userPath,
  loaded: true,
  exports: fakeUserModel,
};
require.cache[questionPath] = {
  id: questionPath,
  filename: questionPath,
  loaded: true,
  exports: { countDocuments: async () => 100 },
};
require.cache[sessionVersionPath] = {
  id: sessionVersionPath,
  filename: sessionVersionPath,
  loaded: true,
  exports: {
    getSessionVersion: async () => 0,
    invalidateSessionVersion: (id) => state.invalidateCalls.push(String(id)),
    bumpSessionVersion: async () => 1,
  },
};

const controller = require("../src/controllers/usersController");

function makeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function reset() {
  state.existing = null;
  state.target = null;
  state.admins = 1;
  state.aggregate = [];
  state.created = null;
  state.deleted = false;
  state.saved = null;
  state.updateOneCalls = [];
  state.updateOneResults = [];
  state.userExists = true;
  state.legacyQuestionExists = false;
  state.answerEvent = null;
  state.answerEventCreateCalls = [];
  state.answerEventDeletedCount = 0;
  state.invalidateCalls = [];
}

function makeSelfUser({ password = "haslo123", rola = "user" } = {}) {
  return {
    _id: "u1",
    login: "self",
    rola,
    password: bcrypt.hashSync(password, 4),
    deleteOne: async () => {
      state.deleted = true;
    },
  };
}

function makeSettingsUser(settings = {}) {
  return {
    _id: "u1",
    login: "admin",
    rola: "admin",
    avatar: 0,
    avatarColors: "#416AFF",
    option: "light",
    hiddenCategory: [],
    settings: { autoNext: true, showDescriptions: true, examLength: 150, ...settings },
    save: async () => {
      state.saved = { ...state.target.settings };
    },
    toObject() {
      return {
        login: this.login,
        rola: this.rola,
        avatar: this.avatar,
        avatarColors: this.avatarColors,
        option: this.option,
        hiddenCategory: this.hiddenCategory,
        settings: this.settings,
      };
    },
  };
}

test("updateProfile: odrzuca liczbę pytań egzaminu poza zakresem", async () => {
  reset();
  state.target = makeSettingsUser();
  const res = makeRes();
  await controller.updateProfile(
    { user: { id: "u1" }, body: { settings: { examLength: 5 } } },
    res
  );
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Liczba pytań w egzaminie/);
  assert.equal(state.saved, null);
});

test("updateProfile: zapisuje poprawną liczbę pytań egzaminu", async () => {
  reset();
  state.target = makeSettingsUser();
  const res = makeRes();
  await controller.updateProfile(
    { user: { id: "u1" }, body: { settings: { examLength: 200 } } },
    res
  );
  assert.equal(res.statusCode, 200);
  assert.equal(state.target.settings.examLength, 200);
  assert.equal(state.saved.examLength, 200);
});

test("createUser: odrzuca niepoprawne dane", async () => {
  reset();
  const res = makeRes();
  await controller.createUser({ body: { login: "x", password: "krotkie" } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Login musi/);
});

test("createUser: odrzuca zajęty login", async () => {
  reset();
  state.existing = { _id: "u1", login: "admin" };
  const res = makeRes();
  await controller.createUser(
    { body: { login: "admin", password: "haslo123", rola: "user" } },
    res
  );
  assert.equal(res.statusCode, 409);
});

test("createUser: tworzy konto i nie zwraca hasła", async () => {
  reset();
  const res = makeRes();
  await controller.createUser(
    { body: { login: "nowy.user", password: "haslo123", rola: "user" } },
    res
  );

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.login, "nowy.user");
  assert.equal(res.body.rola, "user");
  assert.equal(res.body.password, undefined);
  assert.equal(state.created.login, "nowy.user");
});

test("deleteUser: blokuje usunięcie własnego konta", async () => {
  reset();
  state.target = { _id: "u1", rola: "user", login: "ja", deleteOne: async () => {} };
  const res = makeRes();
  await controller.deleteUser({ params: { id: "u1" }, user: { id: "u1" } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /własnego konta/);
});

test("deleteUser: blokuje usunięcie ostatniego administratora", async () => {
  reset();
  state.target = { _id: "u2", rola: "admin", login: "admin2", deleteOne: async () => {} };
  state.admins = 1;
  const res = makeRes();
  await controller.deleteUser({ params: { id: "u2" }, user: { id: "u1" } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /ostatniego administratora/);
});

test("deleteUser: usuwa konto innego użytkownika", async () => {
  reset();
  state.target = {
    _id: "u2",
    rola: "user",
    login: "ktos",
    deleteOne: async () => {
      state.deleted = true;
    },
  };
  const res = makeRes();
  await controller.deleteUser({ params: { id: "u2" }, user: { id: "u1" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(state.deleted, true);
  // Usunięty użytkownik nie może działać z tokenem z cache wersji sesji.
  assert.deepEqual(state.invalidateCalls, ["u2"]);
});

test("deleteSelf: wymaga hasła i odrzuca złe hasło", async () => {
  reset();
  state.target = makeSelfUser();

  let res = makeRes();
  await controller.deleteSelf({ user: { id: "u1" }, body: {} }, res);
  assert.equal(res.statusCode, 400);

  res = makeRes();
  await controller.deleteSelf({ user: { id: "u1" }, body: { password: "zle-haslo" } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Nieprawidłowe hasło/);
  assert.equal(state.deleted, false);
});

test("deleteSelf: blokuje usunięcie ostatniego administratora", async () => {
  reset();
  state.target = makeSelfUser({ password: "haslo123", rola: "admin" });
  state.admins = 1;
  const res = makeRes();

  await controller.deleteSelf(
    { user: { id: "u1" }, body: { password: "haslo123" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /ostatniego administratora/);
  assert.equal(state.deleted, false);
});

test("deleteSelf: usuwa konto przy poprawnym haśle", async () => {
  reset();
  state.target = makeSelfUser({ password: "haslo123", rola: "admin" });
  state.admins = 2;
  const res = makeRes();

  await controller.deleteSelf(
    { user: { id: "u1" }, body: { password: "haslo123" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(state.deleted, true);
});

test("updateHQuestion: nowe pytanie trafia do answer_events", async () => {
  reset();
  const res = makeRes();

  await controller.updateHQuestion(
    { user: { id: "u1" }, body: { id: 5, correct: true, category: "X" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(state.answerEventCreateCalls.length, 1);
  assert.deepEqual(state.answerEventCreateCalls[0], {
    userId: "u1",
    questionId: 5,
    correct: true,
    category: "X",
  });
  assert.equal(state.updateOneCalls.length, 0);
});

test("updateHQuestion: false → true aktualizuje istniejący answer_event", async () => {
  reset();
  state.answerEvent = { _id: "event1", correct: false, category: "X" };
  const res = makeRes();

  await controller.updateHQuestion(
    { user: { id: "u1" }, body: { id: 5, correct: true, category: "Y" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(state.answerEventCreateCalls.length, 0);
  assert.equal(state.updateOneCalls.length, 0);
});

test("updateHQuestion: pytanie z legacy hquestion jest aktualizowane w miejscu", async () => {
  reset();
  state.legacyQuestionExists = true;
  state.updateOneResults = [{ matchedCount: 1, modifiedCount: 1 }];
  const res = makeRes();

  await controller.updateHQuestion(
    { user: { id: "u1" }, body: { id: 5, correct: true, category: "Y" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(state.answerEventCreateCalls.length, 0);
  assert.equal(state.updateOneCalls.length, 1);
  const [, update] = state.updateOneCalls[0];
  assert.equal(update.$set["hquestion.$.correct"], true);
  assert.equal(update.$set["hquestion.$.category"], "Y");
});

test("updateHQuestion: 404, gdy użytkownik nie istnieje", async () => {
  reset();
  state.updateOneResults = [{ matchedCount: 0 }, { matchedCount: 0 }];
  state.userExists = false;
  const res = makeRes();

  await controller.updateHQuestion(
    { user: { id: "u1" }, body: { id: 5, correct: false, category: "X" } },
    res
  );

  assert.equal(res.statusCode, 404);
  // Brak konta nie może utworzyć osieroconego answer_event.
  assert.equal(state.answerEventCreateCalls.length, 0);
});

test("clearCategoryHQuestion: atomowo usuwa legacy i eventy, zwraca sumę", async () => {
  reset();
  state.updateOneResults = [{ matchedCount: 1, modifiedCount: 2 }];
  state.answerEventDeletedCount = 3;
  const res = makeRes();

  await controller.clearCategoryHQuestion(
    { user: { id: "u1" }, body: { category: "X" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.removed, 5);
  const [filter, update] = state.updateOneCalls[0];
  assert.deepEqual(filter, { _id: "u1" });
  assert.deepEqual(update, { $pull: { hquestion: { category: "X" } } });
});

test("updateHQuestion: odrzuca nieprawidłowe ID", async () => {
  reset();
  const res = makeRes();

  await controller.updateHQuestion(
    { user: { id: "u1" }, body: { id: "abc", correct: true, category: "X" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(state.updateOneCalls.length, 0);
});

test("getUsersStats: liczy skuteczność i sumy", async () => {
  reset();
  state.aggregate = [
    { login: "admin", rola: "admin", answersCount: 10, correctAnswers: 8, historyCount: 3 },
    { login: "user", rola: "user", answersCount: 20, correctAnswers: 10, historyCount: 1 },
  ];
  const res = makeRes();
  await controller.getUsersStats({}, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.totals, {
    users: 2,
    admins: 1,
    answers: 30,
    correct: 18,
    quizzes: 4,
    questions: 100,
    accuracy: 60,
  });
  assert.deepEqual(res.body.activity, []);
  assert.deepEqual(res.body.topCategories, []);
});
