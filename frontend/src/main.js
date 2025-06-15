import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/tailwind.css";
import axios from "axios";

axios.defaults.baseURL = "https://app-quize.onrender.com";

// Funkcja do odświeżania tokena
function scheduleTokenRefresh() {
  const refreshInterval = 10 * 60 * 1000; // 10 minut
  setInterval(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.post(
        "/api/auth/refresh",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
    } catch (e) {
      // Jeśli refresh się nie uda, wyloguj użytkownika
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, refreshInterval);
}

// Uruchom odświeżanie po zalogowaniu
if (localStorage.getItem("token")) {
  scheduleTokenRefresh();
}

createApp(App).use(router).use(store).mount("#app");
