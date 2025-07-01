import UserPanel from '../views/UserPanel.vue';
import History from '../views/HistoryView.vue';
export default [
  {
    path: '/user',
    name: 'UserPanel',
    component: UserPanel,
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: { requiresAuth: true },
  },
  {
    path: '/history/:idx',
    name: 'HistoryDetails',
    component: () => import('../views/HistoryDetailsView.vue'),
  },
];