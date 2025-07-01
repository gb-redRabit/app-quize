import AdminView from '../views/AdminView.vue';

export default [
  {
    path: '/admin',
    name: 'AdminView',
    component: AdminView,
    meta: { requiresAuth: true },
  },
];