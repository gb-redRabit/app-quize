const test = require("node:test");
const assert = require("node:assert/strict");

// Stuby zależności kontrolera (bez bazy i bez ExcelJS).
const questionPath = require.resolve("../src/models/Question");
const statsModelPath = require.resolve("../src/models/Stats");
const versionPath = require.resolve("../src/utils/questionsVersion");
const eventsPath = require.resolve("../src/utils/events");

const state = {
  existing: null,
  updated: null,
  updateCalls: 0,
  emitted: null,
};

const QuestionStub = {
  findOne: async () => state.existing,
  findOneAndUpdate: async () => {
    state.updateCalls += 1;
    return state.updated;
  },
  countDocuments: async () => 1,
  aggregate: async () => [],
};
// Kontroler używa też QuestionNot (eksport z tego samego pliku modelu).
require.cache[questionPath] = {
  id: questionPath,
  filename: questionPath,
  loaded: true,
  exports: QuestionStub,
};
require.cache[statsModelPath] = {
  id: statsModelPath,
  filename: statsModelPath,
  loaded: true,
  exports: { findOneAndUpdate: async () => ({}) },
};
require.cache[versionPath] = {
  id: versionPath,
  filename: versionPath,
  loaded: true,
  exports: {
    bumpQuestionsVersion: async () => ({ version: 1 }),
    getQuestionsVersion: async () => ({ version: 1 }),
  },
};
require.cache[eventsPath] = {
  id: eventsPath,
  filename: eventsPath,
  loaded: true,
  exports: { emit: (name, payload) => (state.emitted = { name, payload }) },
};

const controller = require("../src/controllers/questionsController");

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

function validBody(overrides = {}) {
  return {
    question: "Pytanie testowe?",
    answer_a: { answer: "A", isCorret: true },
    answer_b: { answer: "B", isCorret: false },
    answer_c: { answer: "C", isCorret: false },
    category: "Test",
    ...overrides,
  };
}

function reset() {
  state.existing = null;
  state.updated = null;
  state.updateCalls = 0;
  state.emitted = null;
}

test("updateQuestion: odrzuca konflikt wersji (409)", async () => {
  reset();
  const existing = {
    ID: 1,
    question: "Nowsza wersja?",
    updatedAt: new Date("2026-11-26T12:00:00.000Z"),
  };
  state.existing = existing;
  state.updated = existing;
  const res = makeRes();

  await controller.updateQuestion(
    {
      params: { id: "1" },
      body: validBody({ expectedUpdatedAt: "2026-11-26T11:00:00.000Z" }),
    },
    res
  );

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.conflict, true);
  assert.equal(res.body.question, existing);
  assert.equal(state.updateCalls, 0);
});

test("updateQuestion: zgodna wersja zapisuje zmiany", async () => {
  reset();
  const updatedAt = "2026-11-26T12:00:00.000Z";
  state.existing = { ID: 1, question: "Stara?", updatedAt: new Date(updatedAt) };
  state.updated = { ID: 1, question: "Nowa?", updatedAt: new Date(updatedAt) };
  const res = makeRes();

  await controller.updateQuestion(
    { params: { id: "1" }, body: validBody({ expectedUpdatedAt: updatedAt }) },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(state.updateCalls, 1);
  assert.equal(res.body.question, "Nowa?");
  assert.equal(state.emitted?.name, "questions-changed");
});

test("updateQuestion: brak expectedUpdatedAt nie blokuje zapisu", async () => {
  reset();
  state.existing = { ID: 1, question: "Stara?", updatedAt: new Date() };
  state.updated = { ID: 1, question: "Nowa?", updatedAt: new Date() };
  const res = makeRes();

  await controller.updateQuestion({ params: { id: "1" }, body: validBody() }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(state.updateCalls, 1);
});

test("updateQuestion: 404 dla nieistniejącego ID", async () => {
  reset();
  state.existing = null;
  const res = makeRes();

  await controller.updateQuestion({ params: { id: "999" }, body: validBody() }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(state.updateCalls, 0);
});
