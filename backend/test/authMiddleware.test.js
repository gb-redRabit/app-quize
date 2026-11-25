process.env.JWT_SECRET = "test-secret";

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

// Middleware sprawdza wersję sesji w bazie — w teście podmieniamy moduł.
const sessionVersionPath = require.resolve("../src/utils/sessionVersion");
let currentVersion = 0;
require.cache[sessionVersionPath] = {
  id: sessionVersionPath,
  filename: sessionVersionPath,
  loaded: true,
  exports: {
    getSessionVersion: async () => currentVersion,
    invalidateSessionVersion: () => {},
    bumpSessionVersion: async () => (currentVersion += 1),
  },
};

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

function token(ver = 0) {
  return jwt.sign({ id: "user-1", ver }, process.env.JWT_SECRET, { expiresIn: "5m" });
}

test("verifyToken rejects a request without a token", async () => {
  const res = makeRes();
  let nextCalled = false;

  await auth.verifyToken({ headers: {} }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("verifyToken returns 401 for an invalid token", async () => {
  const res = makeRes();
  let nextCalled = false;

  await auth.verifyToken({ headers: { authorization: "Bearer not-a-token" } }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("verifyToken accepts a valid token and exposes its payload", async () => {
  currentVersion = 0;
  const req = { headers: { authorization: `Bearer ${token(0)}` } };
  const res = makeRes();
  let nextCalled = false;

  await auth.verifyToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, "user-1");
});

test("verifyToken rejects a token with an outdated session version", async () => {
  currentVersion = 2;
  const req = { headers: { authorization: `Bearer ${token(1)}` } };
  const res = makeRes();
  let nextCalled = false;

  await auth.verifyToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});
