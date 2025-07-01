import QuizView from '../views/QuizView.vue';
import ExamView from '../views/ExamView.vue';
import CategoryQuestionsView from '../views/CategoryQuestionsView.vue';

export default [
  { path: '/quiz', name: 'QuizView', component: QuizView },
  { path: '/exam', name: 'ExamView', component: ExamView },
  {
    path: '/category/:category',
    name: 'CategoryQuestions',
    component: CategoryQuestionsView,
  },
];
