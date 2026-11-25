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
  },
  {
    ID: 2,
    question: 'E2E: 2 + 2 = ?',
    answer_a: { answer: '3', isCorret: false },
    answer_b: { answer: '4', isCorret: true },
    answer_c: { answer: '5', isCorret: false },
    category: 'E2E',
    description: 'test',
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
    await context.setOffline(true);

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
    await page.waitForTimeout(2000);

    const queueAfterOnline = await page.evaluate(
      () => JSON.parse(localStorage.getItem('offline-queue-v1') || '[]').length
    );
    expect(queueAfterOnline).toBe(0);
    expect(sentAnswers.length).toBeGreaterThan(0);
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
