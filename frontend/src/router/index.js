import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import QuizView from "../views/QuizView.vue";
import AdminView from "../views/AdminView.vue";
import NotFound from "../views/NotFound.vue";
import Login from "../components/Login.vue";
import History from "../views/HistoryView.vue";
import ExamView from "../views/ExamView.vue";
import CategoryQuestionsView from "../views/CategoryQuestionsView.vue";
import axios from "axios";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/quiz", name: "QuizView", component: QuizView },
  {
    path: "/admin",
    name: "AdminView",
    component: AdminView,
    meta: { requiresAuth: true },
  },
  { path: "/login", name: "Login", component: Login },
  {
    path: "/history",
    name: "History",
    component: History,
    meta: { requiresAuth: true },
  },
  {
    path: "/history/:idx",
    name: "HistoryDetails",
    component: () => import("../views/HistoryDetailsView.vue"),
  },
  { path: "/exam", name: "ExamView", component: ExamView },
  {
    path: "/category/:category",
    name: "CategoryQuestions",
    component: CategoryQuestionsView,
  },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("user");
  if (to.name !== "Login" && !isAuthenticated) {
    // Jeśli nie jesteś zalogowany i próbujesz wejść gdziekolwiek poza login
    next({ name: "Login" });
  } else if (to.name === "Login" && isAuthenticated) {
    // Jeśli jesteś zalogowany i próbujesz wejść na login, przekieruj na stronę główną
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;
