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
    next();
  }
});

export default router;
