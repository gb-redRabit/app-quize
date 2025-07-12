export default [
  {
    path: '/admin',
    name: 'AdminView',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin-users',
    name: 'AdminUsersView',
    component: () => import('../views/AdminUsersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];
