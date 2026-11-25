const LOGIN_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const ROLES = ["user", "admin"];

/**
 * Waliduje dane nowego użytkownika tworzonego przez administratora.
 * @returns {{ errors: string[], value: object|null }}
 */
function validateNewUserPayload(body = {}) {
  const errors = [];
  const login = typeof body.login === "string" ? body.login.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const rola = body.rola === undefined ? "user" : body.rola;

  if (!LOGIN_PATTERN.test(login)) {
    errors.push(
      "Login musi mieć 3–32 znaków: litery, cyfry, kropka, podkreślenie lub myślnik"
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Hasło musi mieć ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} znaków`);
  }
  if (!ROLES.includes(rola)) {
    errors.push("Nieprawidłowa rola użytkownika");
  }

  if (errors.length) return { errors, value: null };

  return { errors: [], value: { login, password, rola } };
}

module.exports = { validateNewUserPayload, LOGIN_PATTERN, ROLES };
