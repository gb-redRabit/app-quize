#!/usr/bin/env node
/**
 * Strażnik CSP: sprawdza, czy origin API jest dozwolony w connect-src
 * z frontend/vercel.json. Uruchamiany przed `vite build`.
 *
 * Dzięki temu zmiana VITE_API_URL bez aktualizacji CSP nie przejdzie CI.
 */
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_API_URL = "https://app-quize.onrender.com/api";
const VERCEL_PATH = path.join(__dirname, "..", "vercel.json");

function extractConnectSrc(csp) {
  const match = String(csp || "").match(/connect-src([^;]*)/i);
  if (!match) return [];
  return match[1].trim().split(/\s+/).filter(Boolean);
}

function assertCspAllows(csp, origin) {
  const allowed = extractConnectSrc(csp);
  if (!origin) return { ok: true, origin, allowed };
  if (allowed.includes("*")) return { ok: true, origin, allowed };
  return { ok: allowed.includes(origin), origin, allowed };
}

function readCsp() {
  const config = JSON.parse(fs.readFileSync(VERCEL_PATH, "utf8"));
  for (const group of config.headers || []) {
    for (const header of group.headers || []) {
      if (header.key === "Content-Security-Policy") return header.value;
    }
  }
  return "";
}

function resolveOrigin(apiUrl) {
  if (!apiUrl || apiUrl.startsWith("/")) return null;
  try {
    return new URL(apiUrl).origin;
  } catch {
    return null;
  }
}

function main() {
  // Na CI/Vercel zmienna jest ustawiona; lokalnie używamy produkcyjnego adresu.
  const apiUrl = process.env.VITE_API_URL || DEFAULT_API_URL;
  const origin = resolveOrigin(apiUrl);
  if (!origin) {
    console.log(`[csp] relative API URL (${apiUrl}) — connect-src 'self' wystarcza`);
    return;
  }

  const result = assertCspAllows(readCsp(), origin);
  if (!result.ok) {
    console.error(
      `[csp] Origin API ${origin} nie jest dozwolony w connect-src.\n` +
        `Dodaj go do frontend/vercel.json (nagłówek CSP).\n` +
        `Obecne connect-src: ${result.allowed.join(" ") || "(brak)"}`
    );
    process.exit(1);
  }

  console.log(`[csp] OK: ${origin}`);
}

if (require.main === module) main();

module.exports = { extractConnectSrc, assertCspAllows, resolveOrigin };
