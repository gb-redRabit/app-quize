const test = require("node:test");
const assert = require("node:assert/strict");

// --- Stuby modeli, żeby testować kontroler bez bazy ---
const userPath = require.resolve("../src/models/User");
const questionPath = require.resolve("../src/models/Question");
const sessionVersionPath = require.resolve("../src/utils/sessionVersion");

const state = {
  existing: null,
  target: null,
  admins: 1,
  aggregate: [],
  created: null,
  deleted: false,
};

const fakeUserModel = {
  findOne: async () => state.existing,
  findById: () => ({ select: async () => state.target }),
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
  aggregate: async () => state.aggregate,
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
    invalidateSessionVersion: () => {},
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
}

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
});
