const test = require("node:test");
const assert = require("node:assert/strict");
const { validateQuestionPayload } = require("../src/utils/validateQuestion");

function validPayload(overrides = {}) {
  return {
    question: "  Pytanie?  ",
    category: " TP: Kodeks cywilny ",
    description: "art. 1",
    note: "",
    answer_a: { answer: "A", isCorret: false },
    answer_b: { answer: "B", isCorret: true },
    answer_c: { answer: "C", isCorret: false },
    ...overrides,
  };
}

test("valid payload is normalized and has no errors", () => {
  const { errors, value } = validateQuestionPayload(validPayload());

  assert.deepEqual(errors, []);
  assert.equal(value.question, "Pytanie?");
  assert.equal(value.category, "TP: Kodeks cywilny");
  assert.equal(value.answer_b.isCorret, true);
  assert.equal(value.answer_a.isCorret, false);
});

test("missing question and category are reported", () => {
  const { errors, value } = validateQuestionPayload({
    answer_a: { answer: "A", isCorret: true },
    answer_b: { answer: "B", isCorret: false },
    answer_c: { answer: "C", isCorret: false },
  });

  assert.equal(value, null);
  assert.equal(errors.length, 2);
  assert.match(errors.join(" "), /Treść pytania/);
  assert.match(errors.join(" "), /Kategoria/);
});

test("exactly one correct answer is required", () => {
  const none = validateQuestionPayload(
    validPayload({
      answer_a: { answer: "A", isCorret: false },
      answer_b: { answer: "B", isCorret: false },
      answer_c: { answer: "C", isCorret: false },
    })
  );
  assert.equal(none.value, null);
  assert.match(none.errors.join(" "), /jedna odpowiedź/);

  const two = validateQuestionPayload(
    validPayload({
      answer_a: { answer: "A", isCorret: true },
      answer_b: { answer: "B", isCorret: true },
    })
  );
  assert.equal(two.value, null);
  assert.match(two.errors.join(" "), /jedna odpowiedź/);
});

test("`isCorrect` spelling is accepted and long text is capped", () => {
  const { errors, value } = validateQuestionPayload(
    validPayload({
      question: "x".repeat(6000),
      answer_b: { answer: "B", isCorret: false },
      answer_c: { answer: "C", isCorrect: true },
    })
  );

  assert.deepEqual(errors, []);
  assert.equal(value.question.length, 5000);
  assert.equal(value.answer_c.isCorret, true);
});

test("missing answer texts are reported as errors", () => {
  const { errors, value } = validateQuestionPayload(
    validPayload({
      answer_a: undefined,
      answer_b: undefined,
      answer_c: { answer: "C", isCorret: true },
    })
  );

  assert.equal(value, null);
  assert.match(errors.join(" "), /Odpowiedź A/);
  assert.match(errors.join(" "), /Odpowiedź B/);
});
