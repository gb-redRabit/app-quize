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
    path: '/questions',
    name: 'AllQuestions',
    component: () => import('@/views/AllQuestionsView.vue'),
    meta: { requiresAuth: true },
  },
];
