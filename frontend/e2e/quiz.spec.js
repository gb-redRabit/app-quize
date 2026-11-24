const { test, expect } = require('@playwright/test');

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
  await page.route('**/api/**', async (route) => {
    const request = route.request();
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
  await expect(page.getByRole('heading', { name: 'Witaj w systemie nauki!' })).toBeVisible();
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
    await expect(page.getByText('Lista kategorii')).toBeVisible();
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
});
