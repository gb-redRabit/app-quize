const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * E2E na spreparowanym API (bez bazy i bez mutowania produkcji).
 * Sprawdza: logowanie → Home → quiz → podsumowanie → ponowny start.
 */

const user = {
  _id: 'u1',
  login: 'admin',
  rola: 'admin',
  avatar: 0,
  avatarColors: '#416AFF',
  option: 'light',
  hiddenCategory: [],
  history: [],
  hquestion: [],
  settings: { autoNext: true, showDescriptions: true, examLength: 120 },
};

const questions = [
  {
    ID: 1,
    question: 'E2E: stolica Polski?',
    answer_a: { answer: 'Warszawa', isCorret: true },
    answer_b: { answer: 'Kraków', isCorret: false },
    answer_c: { answer: 'Gdańsk', isCorret: false },
    category: 'E2E',
    description: 'test',
    updatedAt: '2026-11-25T10:00:00.000Z',
  },
  {
    ID: 2,
    question: 'E2E: 2 + 2 = ?',
    answer_a: { answer: '3', isCorret: false },
    answer_b: { answer: '4', isCorret: true },
    answer_c: { answer: '5', isCorret: false },
    category: 'E2E',
    description: 'test',
    updatedAt: '2026-11-25T10:00:00.000Z',
  },
];

function json(body, status = 200) {
  return { status, contentType: 'application/json', body: JSON.stringify(body) };
}

async function mockApi(page) {
  const mockUsers = [
    {
      _id: 'u1',
      login: 'admin',
      rola: 'admin',
      avatar: 0,
      avatarColors: '#416AFF',
      answersCount: 5,
      correctAnswers: 4,
      historyCount: 1,
      lastActivity: '2026-11-24T10:00:00.000Z',
    },
  ];

  const usersStats = () => {
    const totals = mockUsers.reduce(
      (acc, item) => {
        acc.answers += item.answersCount || 0;
        acc.correct += item.correctAnswers || 0;
        acc.quizzes += item.historyCount || 0;
        if (item.rola === 'admin') acc.admins += 1;
        return acc;
      },
      { users: mockUsers.length, admins: 0, answers: 0, correct: 0, quizzes: 0, questions: 2 }
    );
    totals.accuracy = totals.answers
      ? Math.round((totals.correct / totals.answers) * 100)
      : 0;
    return { users: mockUsers, totals };
  };

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api/, '');

    if (path === '/auth/login') {
      return route.fulfill(json({ token: 'e2e-token', user }));
    }
    if (path === '/auth/refresh') {
      return route.fulfill(json({ token: 'e2e-token' }));
    }
    if (path === '/users/me') {
      return route.fulfill(json(user));
    }
    if (path === '/users/stats') {
      return route.fulfill(json(usersStats()));
    }
    if (path === '/users' && method === 'POST') {
      const body = request.postDataJSON() || {};
      const created = {
        _id: `u${mockUsers.length + 1}`,
        login: body.login,
        rola: body.rola || 'user',
        avatar: 0,
        avatarColors: '#416AFF',
        answersCount: 0,
        correctAnswers: 0,
        historyCount: 0,
        lastActivity: null,
      };
      mockUsers.push(created);
      return route.fulfill(json(created, 201));
    }
    if (path.startsWith('/users/') && method === 'DELETE') {
      const id = path.split('/').pop();
      const index = mockUsers.findIndex((item) => item._id === id);
      if (index >= 0) mockUsers.splice(index, 1);
      return route.fulfill(json({ success: true }));
    }
    if (path === '/users/history') {
      return route.fulfill(json([]));
    }
    if (path === '/users/hquestion') {
      return route.fulfill(json([]));
    }
    if (path === '/users/update-profile') {
      return route.fulfill(json(user));
    }
    if (path === '/stats') {
      return route.fulfill(
        json({
          categories: [{ name: 'E2E', count: 2 }],
          totalQuestions: 2,
          updatedAt: new Date().toISOString(),
        })
      );
    }
    if (path === '/questions/version') {
      return route.fulfill(json({ version: 1, count: 2, updatedAt: new Date().toISOString() }));
    }
    if (path === '/questions/snapshot') {
      return route.fulfill(
        json({ version: 1, count: 2, updatedAt: new Date().toISOString(), questions })
      );
    }
    if (path === '/questions/import/excel' && method === 'POST') {
      return route.fulfill(json({ added: 2, skipped: 0, durationMs: 5 }));
    }
    if (path === '/questions') {
      return route.fulfill(json({ questions }));
    }
    if (path.startsWith('/questions/category/')) {
      if (url.searchParams.get('idsOnly') === '1') {
        return route.fulfill(json({ ids: questions.map((q) => q.ID) }));
      }
      return route.fulfill(json(questions));
    }
    if (path === '/events') {
      // SSE nie jest potrzebne w E2E — przerywamy strumień.
      return route.abort();
    }

    return route.fulfill(json({}));
  });
}

async function login(page) {
  await page.goto('/login');
  await page.locator('#login').fill('admin');
  await page.locator('#password').fill('admin');
  await page.getByRole('button', { name: 'Zaloguj się' }).click();
  await expect(page.getByRole('heading', { name: /Cześć/ })).toBeVisible();
}

/** Emuluje offline i czeka, aż przeglądarka zgłosi to w navigator.onLine. */
async function goOffline(page, context) {
  await context.setOffline(true);
  await page
    .waitForFunction(() => navigator.onLine === false, null, { timeout: 5000 })
    .catch(() => {});
}

/**
 * Wypełnia pole i upewnia się, że wartość trafiła do właściwego elementu.
 * Zabezpiecza przed wyścigiem autofokusa w modalach.
 */
async function fillAndVerify(locator, value) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await locator.fill(value);
    if ((await locator.inputValue().catch(() => null)) === value) return;
  }
  await expect(locator).toHaveValue(value);
}

async function answerAllCorrectly(page) {
  for (let i = 0; i < 5; i += 1) {
    if (await page.getByRole('heading', { name: 'Podsumowanie testu' }).isVisible().catch(() => false)) {
      return;
    }

    // Odpowiedzi są tasowane — szukamy po treści, nie po literze.
    if (await page.getByRole('heading', { name: /E2E: stolica Polski/ }).isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /^\w\s*Warszawa$/ }).click();
    } else if (await page.getByRole('heading', { name: /E2E: 2 \+ 2/ }).isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /^\w\s*4$/ }).click();
    }

    await page.waitForTimeout(400);
  }
}

test.describe('Quiz App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('logowanie prowadzi do strony głównej', async ({ page }) => {
    await login(page);

    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.getByRole('heading', { name: 'Kategorie' })).toBeVisible();
  });

  test('nawigacja: tablet 1024–1279 px ma pasek i wylogowanie', async ({ page }) => {
    // Realny przypadek: iPad poziomo lub laptop ze skalowaniem Windows 125%.
    await page.setViewportSize({ width: 1100, height: 800 });
    await login(page);

    const historyLink = page.getByRole('link', { name: 'Historia' }).first();
    await expect(historyLink).toBeVisible();
    await expect(page.getByRole('button', { name: 'Wyloguj' }).first()).toBeVisible();

    await historyLink.click();
    await expect(page).toHaveURL(/\/history$/);
  });

  test('historia: szczegóły działają po reloadzie bez API (IndexedDB)', async ({ page }) => {
    const entry = {
      clientId: 'history-e2e-1',
      type: 'quiz',
      category: 'E2E',
      correct: 1,
      wrong: 0,
      data: '2026-11-20T10:00:00.000Z',
      time: 10,
      list: [{ id_questions: 1, answer: 'answer_a', correct: true }],
      questionTimes: [Date.parse('2026-11-20T10:00:05.000Z') / 1000],
    };
    let historyMode = 'ok';
    await page.route('**/api/users/history', async (route) => {
      if (historyMode === 'ok') return route.fulfill(json([entry]));
      return route.abort();
    });

    await login(page);
    await page.goto('/history');
    await page.getByRole('button', { name: /Pokaż szczegóły/ }).first().click();
    await expect(page.getByText('E2E: stolica Polski?')).toBeVisible();
    await expect(page.getByText('A: Warszawa')).toBeVisible();

    // localStorage trzyma tylko podsumowanie — bez listy odpowiedzi.
    const cached = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cached-history') || '[]')
    );
    expect(cached[0].clientId).toBe('history-e2e-1');
    expect(cached[0].list).toBeUndefined();

    // Po reloadzie bez API historii pełne szczegóły muszą przyjść z IndexedDB.
    historyMode = 'fail';
    await page.reload();
    await page.goto('/history');
    await page.getByRole('button', { name: /Pokaż szczegóły/ }).first().click();
    await expect(page.getByText('E2E: stolica Polski?')).toBeVisible();
    await expect(page.getByText('A: Warszawa')).toBeVisible();
  });

  test('profil: karta pamięci pokazuje zużycie offline', async ({ page }) => {
    await login(page);
    await page.goto('/user');

    await page.getByRole('tab', { name: 'Bezpieczeństwo' }).click();
    await expect(page.getByRole('heading', { name: 'Pamięć urządzenia' })).toBeVisible();
    await expect(
      page.getByRole('progressbar', { name: 'Zużycie pamięci offline' })
    ).toBeVisible();
  });

  test('odpowiedzi: pełna kopia w IndexedDB, nie w localStorage', async ({ page }) => {
    const answers = [{ id: 1, correct: true, category: 'E2E' }];
    await page.route('**/api/users/hquestion', (route) => route.fulfill(json(answers)));

    await login(page);
    await page.waitForTimeout(800);

    const state = await page.evaluate(async () => {
      const marker = JSON.parse(localStorage.getItem('cached-hquestion-user') || 'null');
      const entries = await new Promise((resolve) => {
        const open = indexedDB.open('quiz-user-cache');
        open.onerror = () => resolve(null);
        open.onsuccess = () => {
          const get = open.result
            .transaction('hquestion', 'readonly')
            .objectStore('hquestion')
            .get('all');
          get.onerror = () => resolve(null);
          get.onsuccess = () => resolve(get.result?.value ?? null);
        };
      });
      return {
        legacy: localStorage.getItem('cached-hquestion'),
        marker,
        entries,
      };
    });

    expect(state.legacy).toBeNull();
    expect(state.marker).toEqual({ userId: 'u1', count: 1 });
    expect(state.entries).toEqual(answers);

    // Reload bez API odpowiedzi — statystyki i quiz korzystają z IndexedDB.
    await page.route('**/api/users/hquestion', (route) => route.abort());
    await page.reload();
    await expect(page.getByRole('heading', { name: /Cześć/ })).toBeVisible();
  });

  test('start: zapisana sesja pokazuje pulpit bez czekania na historię', async ({ page }) => {
    let releaseHistory;
    const historyGate = new Promise((resolve) => {
      releaseHistory = resolve;
    });
    let historyRequested = false;

    // Historia celowo wisi — start nie może na nią czekać (cache + tło).
    await page.route('**/api/users/history', async (route) => {
      historyRequested = true;
      await historyGate;
      await route.fulfill(json([]));
    });

    await page.addInitScript(
      ({ cachedUser }) => {
        localStorage.setItem('token', 'e2e-token');
        localStorage.setItem('user', JSON.stringify(cachedUser));
        localStorage.setItem('cached-history', JSON.stringify([]));
        localStorage.setItem('cached-hquestion', JSON.stringify([]));
        localStorage.setItem(
          'stats',
          JSON.stringify({
            categories: [{ name: 'E2E', count: 2 }],
            totalQuestions: 2,
            updatedAt: new Date().toISOString(),
          })
        );
      },
      { cachedUser: user }
    );

    try {
      await page.goto('/');
      await expect(page.getByRole('heading', { name: /Cześć/ })).toBeVisible({
        timeout: 3000,
      });
      await expect(page.getByRole('heading', { name: 'Kategorie' })).toBeVisible();
    } finally {
      releaseHistory();
    }

    // Odświeżenie danych rzeczywiście poszło w tle.
    await expect.poll(() => historyRequested).toBe(true);
  });

  test('egzamin: modal pokazuje skonfigurowaną liczbę pytań', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /Egzamin z ubiegłych lat/ }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('do 120 pytań');
  });

  test('instrukcja: Escape zamyka przewodnik', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /Instrukcja/ }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Krok 1');

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('quiz: odpowiedzi prowadzą do podsumowania z wynikiem', async ({ page }) => {
    await login(page);
    await page.goto('/quiz?length=2&categories=E2E&ids=1,2&r=e2e');

    await expect(
      page.getByRole('heading', { name: /E2E: stolica Polski|E2E: 2 \+ 2/ })
    ).toBeVisible();

    await answerAllCorrectly(page);

    await expect(page.getByRole('heading', { name: 'Podsumowanie testu' })).toBeVisible();
    await expect(page.getByText('2/2')).toBeVisible();
  });

  test('quiz: odpowiadanie nie pobiera całego hquestion z serwera', async ({ page }) => {
    await login(page);

    const hquestionGets = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (request.method() === 'GET' && url.pathname.endsWith('/users/hquestion')) {
        hquestionGets.push(url.pathname);
      }
    });

    // page.goto to pełne wejście w aplikację — startowe odświeżenie w tle
    // może jeszcze trwać. Interesuje nas tylko faza odpowiadania.
    await page.goto('/quiz?length=2&categories=E2E&ids=1,2&r=no-hq');
    await expect(
      page.getByRole('heading', { name: /E2E: stolica Polski|E2E: 2 \+ 2/ })
    ).toBeVisible();
    await page.waitForTimeout(800);
    hquestionGets.length = 0;

    // Odpowiedz na pierwsze pytanie i sprawdź, że nie poleciał GET hquestion.
    if (
      await page
        .getByRole('heading', { name: /E2E: stolica Polski/ })
        .isVisible()
        .catch(() => false)
    ) {
      await page.getByRole('button', { name: /^\w\s*Warszawa$/ }).click();
    } else {
      await page.getByRole('button', { name: /^\w\s*4$/ }).click();
    }
    await page.waitForTimeout(600);
    expect(hquestionGets).toHaveLength(0);

    // Po zakończeniu quizu wolno odświeżyć dane raz (rekoncyliacja z serwerem).
    await answerAllCorrectly(page);
    await expect(page.getByRole('heading', { name: 'Podsumowanie testu' })).toBeVisible();
    expect(hquestionGets.length).toBeLessThanOrEqual(1);
  });

  test('podsumowanie: „Wróć do strony głównej” prowadzi do pulpitu', async ({ page }) => {
    await login(page);
    await page.goto('/quiz?length=2&categories=E2E&ids=1,2&r=e2e-home');

    await answerAllCorrectly(page);
    await expect(page.getByRole('heading', { name: 'Podsumowanie testu' })).toBeVisible();

    await page.getByRole('button', { name: /Wróć do strony głównej/ }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /Cześć/ })).toBeVisible();
  });

  test('„Rozpocznij ponownie” wraca do pytań', async ({ page }) => {
    await login(page);
    await page.goto('/quiz?length=2&categories=E2E&ids=1,2&r=e2e2');

    await answerAllCorrectly(page);
    await expect(page.getByRole('heading', { name: 'Podsumowanie testu' })).toBeVisible();

    await page.getByRole('button', { name: /Rozpocznij ponownie/ }).click();

    await expect(
      page.getByRole('heading', { name: /E2E: stolica Polski|E2E: 2 \+ 2/ })
    ).toBeVisible();
  });

  test('klawiatura: skip link i widoczny fokus', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Zaloguj się' })).toBeVisible();

    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = getComputedStyle(el);
      return {
        text: (el?.textContent || '').trim(),
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        visibleWidth: el?.getBoundingClientRect().width || 0,
      };
    });

    expect(focused.text).toContain('Przejdź do treści');
    expect(focused.visibleWidth).toBeGreaterThan(0);
    expect(focused.outlineStyle).not.toBe('none');
    expect(parseFloat(focused.outlineWidth)).toBeGreaterThan(0);
  });

  test('klawiatura: strzałki i Enter w liście pytań', async ({ page }) => {
    await login(page);
    await page.goto('/questions');

    const firstRow = page.locator('[data-question-id]').first();
    await expect(firstRow).toBeVisible();
    await firstRow.focus();
    await expect(firstRow).toBeFocused();

    await page.keyboard.press('ArrowDown');
    const focusedId = await page.evaluate(() =>
      document.activeElement?.getAttribute('data-question-id')
    );
    expect(focusedId).toBe('2');

    await page.keyboard.press('Enter');
    await expect(page.getByTestId('question-details')).toContainText('ID 2');
  });

  test('mobile: szczegóły pytania otwierają się w modalu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page);
    await page.goto('/questions');

    const firstRow = page.locator('[data-question-id]').first();
    await expect(firstRow).toBeVisible();
    await firstRow.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('ID 1');
    await expect(dialog).toContainText('E2E: stolica Polski');

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('mobile: kategoria otwiera szczegóły pytania w modalu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page);
    await page.goto('/category/E2E');

    const card = page.getByRole('button', { name: /E2E: stolica Polski/ }).first();
    await expect(card).toBeVisible();
    await card.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Pytanie ID 1');
    await expect(dialog).toContainText('Warszawa');

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('admin: modal dodawania pytania ma focus trap i Escape', async ({ page }) => {
    await login(page);
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Panel Administratora' })).toBeVisible();

    const trigger = page.getByRole('button', { name: /Dodaj pytanie/ });
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))))
      .toBe(true);

    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
    }
    const focusInside = await page.evaluate(() =>
      Boolean(document.activeElement?.closest('[role="dialog"]'))
    );
    expect(focusInside).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('admin: walidacja nowego pytania oznacza brakujące pola', async ({ page }) => {
    await login(page);
    await page.goto('/admin');
    await page.getByRole('button', { name: /Dodaj pytanie/ }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Zapisz pytanie' }).click();

    await expect(dialog).toContainText('Podaj treść pytania.');
    await expect(dialog).toContainText('Podaj treść odpowiedzi A.');
    await expect(dialog).toContainText('Wskaż dokładnie jedną poprawną odpowiedź.');
    await expect(dialog).toContainText('Wybierz kategorię.');
    await expect(page.locator('#question-text')).toBeFocused();
  });

  test('admin: walidacja nowego użytkownika pokazuje błędy', async ({ page }) => {
    await login(page);
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Użytkownicy', exact: true }).click();
    await page.getByRole('button', { name: 'Dodaj użytkownika' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Dodaj', exact: true }).click();

    await expect(dialog).toContainText('Login musi mieć 3–32 znaków.');
    await expect(dialog).toContainText('Hasło musi mieć co najmniej 8 znaków.');
    await expect(page.locator('#new-user-login')).toBeFocused();
  });

  test('admin: dodaje i usuwa użytkownika', async ({ page }) => {
    await login(page);
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Użytkownicy', exact: true }).click();

    await expect(page.locator('tbody tr').first()).toContainText('admin');

    await page.getByRole('button', { name: 'Dodaj użytkownika' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('#new-user-login').fill('e2e.nowy');
    await dialog.locator('#new-user-password').fill('haslo123');
    await dialog.getByRole('button', { name: 'Dodaj', exact: true }).click();

    await expect(page.locator('tbody tr').filter({ hasText: 'e2e.nowy' })).toBeVisible();

    await page.getByRole('button', { name: 'Usuń użytkownika e2e.nowy' }).click();
    await page.getByRole('button', { name: 'Usuń konto' }).click();

    await expect(page.locator('tbody tr').filter({ hasText: 'e2e.nowy' })).toHaveCount(0);
  });

  test('offline: wynik trafia do kolejki i wysyła się po powrocie sieci', async ({
    page,
    context,
  }) => {
    await login(page);

    const sentAnswers = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/users/hquestion')) {
        sentAnswers.push(request.postDataJSON());
      }
    });

    await page.goto('/quiz?length=2&categories=E2E&ids=1,2&r=e2e');
    // Poczekaj na pytanie, zanim odetniemy sieć (start quizu pobiera dane).
    await expect(
      page.getByRole('heading', { name: /E2E: stolica Polski|E2E: 2 \+ 2/ })
    ).toBeVisible();

    // Zdejmujemy mocki, żeby offline naprawdę kończył się błędem sieci.
    await page.unroute('**/api/**');
    await goOffline(page, context);

    await answerAllCorrectly(page);
    await expect(page.getByRole('heading', { name: 'Podsumowanie testu' })).toBeVisible();

    const queueWhileOffline = await page.evaluate(
      () => JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').length
    );
    expect(queueWhileOffline).toBeGreaterThan(0);

    // Przywracamy API i sieć, żeby kolejka mogła się opróżnić.
    sentAnswers.length = 0;
    await mockApi(page);
    await context.setOffline(false);

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').length
          ),
        { timeout: 15000 }
      )
      .toBe(0);
    expect(sentAnswers.length).toBeGreaterThan(0);
  });

  test('offline: ekran nigdy wcześniej nieotwarty ładuje się z precache', async ({
    page,
    context,
  }) => {
    await login(page);

    // Poczekaj, aż service worker zainstaluje precache i przejmie stronę.
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, {
      timeout: 20000,
    });

    await goOffline(page, context);
    await page.goto('/history');

    await expect(page.getByRole('heading', { name: 'Historia nauki' })).toBeVisible();
  });

  test('offline: pasek można ukryć, a po powrocie sieci pokazuje się ponownie', async ({
    page,
    context,
  }) => {
    await login(page);

    await goOffline(page, context);
    const banner = page.getByRole('status').filter({ hasText: 'Tryb offline' });
    await expect(banner).toBeVisible();

    await page.getByRole('button', { name: /Ukryj powiadomienie o braku połączenia/ }).click();
    await expect(banner).not.toBeVisible();

    await context.setOffline(false);
    await page.waitForTimeout(300);
    await goOffline(page, context);
    await expect(banner).toBeVisible();
  });

  test('offline: edycja pytania trafia do kolejki i wysyła się po powrocie sieci', async ({
    page,
    context,
  }) => {
    await login(page);
    await page.goto('/questions');
    await page.locator('[data-question-id="1"]').click();

    const details = page.getByTestId('question-details');
    await details.getByRole('button', { name: 'Edytuj' }).click();

    const questionField = page.locator('#inline-edit-1-question');
    await expect(questionField).toBeVisible();
    await fillAndVerify(questionField, 'E2E offline: zmienione pytanie?');

    await page.unroute('**/api/**');
    await goOffline(page, context);
    await page.getByRole('button', { name: 'Zapisz zmiany' }).click();

    const queuedUpdate = () =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').some(
          (op) => op.type === 'question-update' && op.payload.ID === 1
        )
      );

    await expect.poll(queuedUpdate, { timeout: 10000 }).toBe(true);
    await expect(details).toContainText('E2E offline: zmienione pytanie?');

    const updates = [];
    page.on('request', (request) => {
      if (request.method() === 'PUT' && request.url().includes('/questions/1')) {
        updates.push(request.postDataJSON());
      }
    });

    await mockApi(page);
    await context.setOffline(false);

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').length
          ),
        { timeout: 15000 }
      )
      .toBe(0);
    expect(updates.length).toBeGreaterThan(0);
  });

  test('offline: nowe pytanie czeka w kolejce i wysyła się po powrocie sieci', async ({
    page,
    context,
  }) => {
    await login(page);
    await page.goto('/admin');
    await page.getByRole('button', { name: /Dodaj pytanie/ }).click();

    const dialog = page.getByRole('dialog');
    await fillAndVerify(dialog.locator('#answer-a'), 'Tak');
    await fillAndVerify(dialog.locator('#answer-b'), 'Nie');
    await fillAndVerify(dialog.locator('#answer-c'), 'Może');
    await fillAndVerify(dialog.locator('#question-text'), 'E2E offline: nowe pytanie?');
    await dialog.locator('#correct-a').click();
    await dialog.locator('#category').selectOption('E2E');

    await page.unroute('**/api/**');
    await goOffline(page, context);
    await dialog.getByRole('button', { name: 'Zapisz pytanie' }).click();

    await expect(dialog).not.toBeVisible();

    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').some(
              (op) => op.type === 'question-create'
            )
          ),
        { timeout: 10000 }
      )
      .toBe(true);

    const creates = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().endsWith('/api/questions')) {
        creates.push(request.postDataJSON());
      }
    });

    await mockApi(page);
    await context.setOffline(false);

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').length
          ),
        { timeout: 15000 }
      )
      .toBe(0);
    expect(creates).toHaveLength(1);
    expect(creates[0].question).toBe('E2E offline: nowe pytanie?');
  });

  test('offline: usunięcie pytania czeka w kolejce i wysyła się po powrocie sieci', async ({
    page,
    context,
  }) => {
    await login(page);
    await page.goto('/questions');
    await page.locator('[data-question-id="1"]').click();

    const details = page.getByTestId('question-details');
    await details.getByRole('button', { name: 'Usuń' }).click();

    const confirm = page.getByRole('dialog');
    await expect(confirm).toContainText('Usuń pytanie');

    await page.unroute('**/api/**');
    await goOffline(page, context);
    await confirm.getByRole('button', { name: 'Tak, usuń' }).click();

    await expect(page.locator('[data-question-id="1"]')).toHaveCount(0);
    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').some(
              (op) => op.type === 'question-delete' && op.payload.ID === 1
            )
          ),
        { timeout: 10000 }
      )
      .toBe(true);

    const deletes = [];
    page.on('request', (request) => {
      if (request.method() === 'DELETE' && request.url().includes('/questions/1')) {
        deletes.push(request.url());
      }
    });

    await mockApi(page);
    await context.setOffline(false);

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').length
          ),
        { timeout: 15000 }
      )
      .toBe(0);
    expect(deletes).toHaveLength(1);
  });

  test('offline: duplikaty liczą się z lokalnego cache', async ({ page, context }) => {
    await login(page);
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await page.waitForTimeout(2000); // snapshot pytań → IndexedDB

    await page.unroute('**/api/**');
    await goOffline(page, context);
    await page.goto('/duplikaty');

    await expect(page.getByText('Brak duplikatów pytań')).toBeVisible({ timeout: 15000 });
  });

  test('offline: grupowa edycja pytań trafia do kolejki', async ({ page, context }) => {
    await login(page);
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Grupowa edycja', exact: true }).click();

    await page.locator('#batch-ids').fill('1,2');
    await page.getByRole('button', { name: 'Pobierz pytania' }).click();
    await expect(page.getByText('E2E: stolica Polski')).toBeVisible();

    await page.locator('#batch-category').selectOption('E2E');

    await page.unroute('**/api/**');
    await goOffline(page, context);
    await page.getByRole('button', { name: 'Zapisz zmiany' }).click();

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const queue = JSON.parse(localStorage.getItem('offline-queue-v1') || '[]');
            const ids = queue
              .filter((op) => op.type === 'question-update')
              .map((op) => op.payload.ID)
              .sort();
            return ids.join(',');
          }),
        { timeout: 10000 }
      )
      .toBe('1,2');

    const updates = [];
    page.on('request', (request) => {
      if (request.method() === 'PUT' && request.url().includes('/questions/')) {
        updates.push(request.url());
      }
    });

    await mockApi(page);
    await context.setOffline(false);

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').length
          ),
        { timeout: 15000 }
      )
      .toBe(0);
    expect(updates).toHaveLength(2);
  });

  test('offline: nowe pytanie jest widoczne na liście do synchronizacji', async ({
    page,
    context,
  }) => {
    await login(page);
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await page.waitForTimeout(1500); // snapshot pytań → IndexedDB

    await page.goto('/admin');
    await page.getByRole('button', { name: /Dodaj pytanie/ }).click();
    const dialog = page.getByRole('dialog');
    await fillAndVerify(dialog.locator('#answer-a'), 'Tak');
    await fillAndVerify(dialog.locator('#answer-b'), 'Nie');
    await fillAndVerify(dialog.locator('#answer-c'), 'Może');
    await fillAndVerify(dialog.locator('#question-text'), 'E2E offline: widoczne pytanie?');
    await dialog.locator('#correct-a').click();
    await dialog.locator('#category').selectOption('E2E');

    await page.unroute('**/api/**');
    await goOffline(page, context);
    await dialog.getByRole('button', { name: 'Zapisz pytanie' }).click();
    await expect(dialog).not.toBeVisible();

    await page.goto('/questions');
    await expect(page.getByText('E2E offline: widoczne pytanie?').first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('Nowe', { exact: true }).first()).toBeVisible();

    await mockApi(page);
    await context.setOffline(false);
    await expect
      .poll(
        async () =>
          page.evaluate(
            () => JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').length
          ),
        { timeout: 15000 }
      )
      .toBe(0);
    await page.waitForTimeout(1200);
    await expect(page.getByText('E2E offline: widoczne pytanie?')).toHaveCount(0);
  });

  test('konflikt edycji: 409 pokazuje ostrzeżenie i wersję z serwera', async ({ page }) => {
    await login(page);
    await page.goto('/questions');
    await page.locator('[data-question-id="1"]').click();

    const details = page.getByTestId('question-details');
    await details.getByRole('button', { name: 'Edytuj' }).click();
    const field = page.locator('#inline-edit-1-question');
    await expect(field).toBeVisible();
    await fillAndVerify(field, 'Moja wersja?');

    await page.route('**/api/questions/1', async (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill(
          json(
            {
              message: 'Pytanie zostało zmienione w innym miejscu.',
              conflict: true,
              question: {
                ...questions[0],
                question: 'Wersja z serwera?',
                updatedAt: '2026-11-26T10:00:00.000Z',
              },
            },
            409
          )
        );
      }
      return route.continue();
    });

    await page.getByRole('button', { name: 'Zapisz zmiany' }).click();

    await expect(
      page.getByRole('alert').filter({ hasText: 'zmienione w innym miejscu' })
    ).toBeVisible();
    await expect(details).toContainText('Wersja z serwera?');
  });

  test('offline: import Excel czeka w kolejce i wysyła się po powrocie sieci', async ({
    page,
    context,
  }) => {
    await login(page);
    await page.goto('/admin');

    await page.unroute('**/api/**');
    await goOffline(page, context);

    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'pytania.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('fake-xlsx-content'),
    });

    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').some(
              (op) => op.type === 'import-excel'
            )
          ),
        { timeout: 10000 }
      )
      .toBe(true);

    const uploads = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/questions/import/excel')) {
        uploads.push(request.url());
      }
    });

    await mockApi(page);
    await context.setOffline(false);

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').length
          ),
        { timeout: 15000 }
      )
      .toBe(0);
    expect(uploads).toHaveLength(1);
    await expect(
      page.getByRole('alert').filter({ hasText: /Import z kolejki/ })
    ).toBeVisible({ timeout: 10000 });
  });

  test('konto: eksport danych i usunięcie konta', async ({ page }) => {
    await login(page);
    await page.goto('/user');
    await page.getByRole('tab', { name: 'Bezpieczeństwo', exact: true }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Pobierz moje dane' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^quiz-app-dane-.*\.json$/);

    await page.getByRole('button', { name: 'Usuń konto' }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('#delete-account-password').fill('admin');
    await dialog.getByRole('button', { name: 'Usuń konto' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('skróty: ? otwiera pomoc, g h wraca na pulpit', async ({ page }) => {
    await login(page);
    await page.goto('/questions');
    await page.getByRole('heading', { name: 'Wszystkie pytania' }).click();

    await page.keyboard.press('Shift+/');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Skróty klawiszowe');

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    await page.goto('/user');
    await page.getByText('Zarządzaj profilem, wyglądem i preferencjami nauki.').click();
    await page.keyboard.press('g');
    await page.keyboard.press('h');

    await expect(page.getByRole('heading', { name: /Cześć/ })).toBeVisible();
  });

  test('quiz: odpowiedź wybrana klawiaturą odblokowuje „Następne”', async ({ page }) => {
    await login(page);
    await page.goto('/quiz?length=2&categories=E2E&ids=1,2&r=kb');

    // Wyłącz auto-next, żeby sprawdzić stan przycisku po wyborze.
    await page.getByRole('button', { name: /Auto-Next/ }).click();

    // Pytania są tasowane — wybieramy poprawną odpowiedź do widocznego pytania.
    const isCapitalQuestion = await page
      .getByRole('heading', { name: /stolica Polski/ })
      .isVisible()
      .catch(() => false);
    const answer = isCapitalQuestion
      ? page.getByRole('button', { name: /^\w\s*Warszawa$/ })
      : page.getByRole('button', { name: /^\w\s*4$/ });

    await expect(answer).toBeVisible();
    await answer.focus();
    await expect(answer).toBeFocused();

    await page.keyboard.press('Enter');

    await expect(page.getByRole('button', { name: /Następne/ })).toBeEnabled();
    await expect(answer).toBeFocused();
    await expect(answer).toHaveAttribute('aria-disabled', 'true');
  });

  test('logowanie i strona główna bez poważnych naruszeń WCAG', async ({ page }) => {
    // Wyłącz animacje wejścia — axe skanowałby kolory w trakcie przenikania.
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const serious = (violations) =>
      violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Zaloguj się' })).toBeVisible();
    await page.waitForTimeout(300);

    const loginResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(serious(loginResults.violations)).toEqual([]);

    await login(page);
    await page.waitForTimeout(2000);

    const homeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(serious(homeResults.violations)).toEqual([]);

    await page.goto('/questions');
    await expect(page.getByText(/Wczytano \d+ z \d+/)).toBeVisible();
    await page.waitForTimeout(800);
    const questionsResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(serious(questionsResults.violations)).toEqual([]);

    await page.goto('/user');
    await page.waitForTimeout(1200);
    const userResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(serious(userResults.violations)).toEqual([]);
  });
});

test.describe('odporność na stare chunki po wdrożeniu', () => {
  // Bez SW, żeby przechwycić żądanie chunku i podać HTML (jak Vercel po deployu).
  test.use({ serviceWorkers: 'block' });

  test('błąd importu chunku przeładowuje stronę i otwiera nowy widok', async ({ page }) => {
    await mockApi(page);
    await login(page);

    let reloads = 0;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) reloads += 1;
    });

    let firstChunk = true;
    await page.route(/\/assets\/UserPanel-[A-Za-z0-9_-]+\.js$/, async (route) => {
      if (firstChunk) {
        firstChunk = false;
        return route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<!doctype html><html><body>stale chunk</body></html>',
        });
      }
      return route.continue();
    });

    await page.getByRole('link', { name: /Panel użytkownika/ }).click();

    // Strona przeładowuje się do świeżego index.html (raz, bez pętli).
    await expect.poll(() => reloads, { timeout: 10000 }).toBeGreaterThan(1);
    await page.waitForLoadState('load');

    // Po reloadzie możemy wylądować na poprzedniej trasie albo na Home.
    if (!page.url().endsWith('/user')) {
      await page.getByRole('link', { name: /Panel użytkownika/ }).click();
    }

    await expect(
      page.getByText('Zarządzaj profilem, wyglądem i preferencjami nauki.')
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('tab', { name: 'Nauka', exact: true })).toBeVisible();
  });
});
