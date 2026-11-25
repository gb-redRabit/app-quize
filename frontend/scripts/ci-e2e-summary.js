/**
 * Wypisuje nieudane testy E2E do podsumowania GitHub Actions.
 * Dzięki temu komunikat błędu jest widoczny publicznie w runie (logi wymagają logowania).
 */
const fs = require('fs');

const resultsPath = 'test-results/results.json';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!summaryPath) {
  console.log('Brak GITHUB_STEP_SUMMARY — pomijam.');
  process.exit(0);
}

if (!fs.existsSync(resultsPath)) {
  fs.appendFileSync(summaryPath, 'Brak pliku test-results/results.json.\n');
  process.exit(0);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const lines = [];

function walk(suite, path) {
  for (const child of suite.suites || []) {
    walk(child, [...path, child.title]);
  }
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const failed = (test.results || []).filter(
        (result) => result.status === 'failed' || result.status === 'timedOut'
      );
      for (const result of failed) {
        lines.push(`### ${[...path, spec.title].join(' > ')}`);
        lines.push('```');
        lines.push(
          String(result.error?.message || result.error?.stack || 'Nieznany błąd').slice(0, 4000)
        );
        lines.push('```');
      }
    }
  }
}

for (const suite of results.suites || []) walk(suite, []);

if (lines.length === 0) {
  lines.push('Brak nieudanych testów w results.json.');
}

fs.appendFileSync(summaryPath, `${lines.join('\n')}\n`);
