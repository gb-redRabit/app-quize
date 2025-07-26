export default [
  {
    path: '/admin',
    name: 'AdminView',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];
