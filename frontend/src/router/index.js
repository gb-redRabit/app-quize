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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // zawsze przewijaj na górę
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!sessionStorage.getItem('user') && !!sessionStorage.getItem('token');
  if (to.name !== 'Login' && to.name !== 'Register' && !isAuthenticated) {
    next({ name: 'Login' });
  } else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
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

router.afterEach(() => {
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
