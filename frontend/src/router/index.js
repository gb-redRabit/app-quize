import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import QuizView from "../views/QuizView.vue";
import AdminView from "../views/AdminView.vue";
import NotFound from "../views/NotFound.vue";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import History from "../views/HistoryView.vue";
import ExamView from "../views/ExamView.vue";
import CategoryQuestionsView from "../views/CategoryQuestionsView.vue";
import UserPanel from "../views/UserPanel.vue";

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
  { path: "/register", name: "Register", component: Register },
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
  {
    path: "/user",
    name: "UserPanel",
    component: UserPanel,
    meta: { requiresAuth: true },
  },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated =
    !!sessionStorage.getItem("user") && !!sessionStorage.getItem("token");
  if (to.name !== "Login" && to.name !== "Register" && !isAuthenticated) {
    next({ name: "Login" });
  } else if (
    (to.name === "Login" || to.name === "Register") &&
    isAuthenticated
  ) {
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;
