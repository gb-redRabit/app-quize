const test = require("node:test");
const assert = require("node:assert/strict");
const { createRateLimit } = require("../src/middleware/rateLimit");

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
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

function run(limiter, ip = "10.0.0.1") {
  let nextCalled = false;
  const res = makeRes();
  limiter({ ip, socket: { remoteAddress: ip } }, res, () => {
    nextCalled = true;
  });
  return { nextCalled, res };
}

test("allows requests up to the limit, then returns 429 with Retry-After", () => {
  const limiter = createRateLimit({ windowMs: 60_000, max: 3, message: "too many" });

  assert.equal(run(limiter).nextCalled, true);
  assert.equal(run(limiter).nextCalled, true);
  assert.equal(run(limiter).nextCalled, true);

  const blocked = run(limiter);
  assert.equal(blocked.nextCalled, false);
  assert.equal(blocked.res.statusCode, 429);
  assert.equal(blocked.res.body.message, "too many");
  assert.ok(Number(blocked.res.headers["Retry-After"]) > 0);
});

test("different IPs have independent counters", () => {
  const limiter = createRateLimit({ windowMs: 60_000, max: 1 });

  assert.equal(run(limiter, "1.1.1.1").nextCalled, true);
  assert.equal(run(limiter, "1.1.1.1").nextCalled, false);
  assert.equal(run(limiter, "2.2.2.2").nextCalled, true);
});

test("separate limiters do not share counters", () => {
  const first = createRateLimit({ windowMs: 60_000, max: 1 });
  const second = createRateLimit({ windowMs: 60_000, max: 1 });

  assert.equal(run(first).nextCalled, true);
  assert.equal(run(first).nextCalled, false);
  assert.equal(run(second).nextCalled, true);
});
