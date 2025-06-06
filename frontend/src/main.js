import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/tailwind.css";
import axios from "axios";

axios.defaults.baseURL = "https://quiz-app-rysh.onrender.com";

createApp(App).use(router).use(store).mount("#app");
