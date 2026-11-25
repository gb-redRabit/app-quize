import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';

import authRoutes from './auth';
import quizRoutes from './quiz';
import userRoutes from './user';
import adminRoutes from './admin';

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  ...authRoutes,
  ...quizRoutes,
  ...userRoutes,
  ...adminRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "notfound" */ '../views/NotFound.vue'),
  },
  {
    path: '/server-error',
    name: 'ServerError',
    component: () => import('../views/ServerError.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // zawsze przewijaj na górę
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token');
  const rawUser = sessionStorage.getItem('user');
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (e) {
    console.warn('Nieprawidłowe dane użytkownika w sessionStorage');
  }

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.rola === 'admin';

  if (to.name !== 'Login' && to.name !== 'Register' && !isAuthenticated) {
    next({ name: 'Login' });
  } else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    next({ name: 'Home' });
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next({ name: 'Home' });
  } else {
    // Bezpieczniejsze pokazywanie loadera
    try {
      const app = document.getElementById('app')?.__vue_app__;
      if (app && app._instance && app._instance.proxy) {
        const vm = app._instance.proxy;
        if (vm.$showLoader) {
          vm.$showLoader('Zmiana strony...');
        }
      }
    } catch (e) {
      console.warn('Nie można pokazać loadera podczas zmiany strony');
    }
    next();
  }
});

const PAGE_TITLES = {
  Home: 'Strona główna',
  Login: 'Logowanie',
  Register: 'Rejestracja',
  History: 'Historia',
  AllQuestions: 'Lista pytań',
  CategoryQuestions: 'Pytania w kategorii',
  DuplicateQuestions: 'Duplikaty pytań',
  UserPanel: 'Panel użytkownika',
  AdminView: 'Panel administracyjny',
  QuizView: 'Quiz',
  ExamView: 'Egzamin',
  NotFound: 'Nie znaleziono',
  ServerError: 'Błąd serwera',
};

router.afterEach((to) => {
  const title = PAGE_TITLES[to.name];
  document.title = title ? `${title} · Quiz App` : 'Quiz App';

  // Bezpieczniejsze ukrywanie loadera
  setTimeout(() => {
    try {
      const app = document.getElementById('app')?.__vue_app__;
      if (app && app._instance && app._instance.proxy) {
        const vm = app._instance.proxy;
        if (vm.$hideLoader) {
          vm.$hideLoader();
        }
      }
    } catch (e) {
      console.warn('Nie można ukryć loadera po zmianie strony');
    }
  }, 200);
});

router.onError((error) => {
  console.error('Błąd routera:', error);

  // Możesz przekierować do strony błędu lub pokazać alert
  if (error.name === 'NavigationFailure') {
    // Obsługa błędów nawigacji
  }
});

export default router;
