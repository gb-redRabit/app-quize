export default [
  { path: '/quiz', name: 'QuizView', component: () => import('../views/QuizView.vue') },
  { path: '/exam', name: 'ExamView', component: () => import('../views/ExamView.vue') },
  {
    path: '/category/:category',
    name: 'CategoryQuestions',
    component: () => import('../views/CategoryQuestionsView.vue'),
  },
];
