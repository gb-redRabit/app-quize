export default [
  {
    path: '/user',
    name: 'UserPanel',
    component: () => import('../views/UserPanel.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/history/:id',
    name: 'HistoryDetails',
    component: () => import('@/views/HistoryDetailsView.vue'),
    meta: { requiresAuth: true },
  },
];
