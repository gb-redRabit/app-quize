const test = require("node:test");
const assert = require("node:assert/strict");
const { validateNewUserPayload } = require("../src/utils/validateUser");

test("poprawne dane tworzą użytkownika z domyślną rolą user", () => {
  const { errors, value } = validateNewUserPayload({ login: "jan.kowalski", password: "haslo123" });

  assert.deepEqual(errors, []);
  assert.deepEqual(value, { login: "jan.kowalski", password: "haslo123", rola: "user" });
});

test("przycina spacje w loginie i przyjmuje rolę admin", () => {
  const { errors, value } = validateNewUserPayload({
    login: "  admin2 ",
    password: "tajnehaslo",
    rola: "admin",
  });

  assert.deepEqual(errors, []);
  assert.equal(value.login, "admin2");
  assert.equal(value.rola, "admin");
});

test("odrzuca zły login", () => {
  const { errors, value } = validateNewUserPayload({ login: "a!", password: "haslo123" });

  assert.equal(value, null);
  assert.match(errors.join(" "), /Login musi/);
});

test("odrzuca za krótkie i za długie hasło", () => {
  const short = validateNewUserPayload({ login: "user1", password: "krotkie" });
  assert.equal(short.value, null);
  assert.match(short.errors.join(" "), /Hasło musi/);

  const long = validateNewUserPayload({ login: "user1", password: "x".repeat(73) });
  assert.equal(long.value, null);
  assert.match(long.errors.join(" "), /Hasło musi/);
});

test("odrzuca nieznaną rolę", () => {
  const { errors, value } = validateNewUserPayload({
    login: "user1",
    password: "haslo123",
    rola: "owner",
  });

  assert.equal(value, null);
  assert.match(errors.join(" "), /rola/);
});
