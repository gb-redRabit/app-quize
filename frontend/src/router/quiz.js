export default [
  { path: '/quiz', name: 'QuizView', component: () => import('../views/QuizExamView.vue') },
  { path: '/exam', name: 'ExamView', component: () => import('../views/QuizExamView.vue') },
  {
    path: '/category/:category',
    name: 'CategoryQuestions',
    component: () => import('../views/CategoryQuestionsView.vue'),
  },
  {
    path: '/duplikaty',
    name: 'DuplicateQuestions',
    component: () => import('@/views/DuplicateQuestionsView.vue'),
    meta: { requiresAuth: true }, // jeśli potrzebujesz autoryzacji
  },
];
