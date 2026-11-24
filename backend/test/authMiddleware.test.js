process.env.JWT_SECRET = "test-secret";

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const auth = require("../src/middleware/authMiddleware");

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

test("verifyToken rejects a request without a token", () => {
  const res = makeRes();
  let nextCalled = false;

  auth.verifyToken({ headers: {} }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("verifyToken returns 401 for an invalid token", () => {
  const res = makeRes();
  let nextCalled = false;

  auth.verifyToken({ headers: { authorization: "Bearer not-a-token" } }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("verifyToken accepts a valid token and exposes its payload", () => {
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET, { expiresIn: "5m" });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = makeRes();
  let nextCalled = false;

  auth.verifyToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, "user-1");
});
