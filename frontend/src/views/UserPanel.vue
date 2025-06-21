<template>
  <div class="container mx-auto p-4 max-w-lg">
    <h1 class="text-2xl font-bold mb-6">Panel użytkownika</h1>
    <div class="mb-6 flex items-center gap-2">
      <label class="block font-semibold mb-1">Login:</label>
      <div class="rounded p-2">{{ user.login }}</div>
    </div>
    <div class="mb-6 flex items-center gap-2">
      <label class="block font-semibold mb-1">Motyw:</label>
      <select v-model="theme" class="p-2 border rounded">
        <option value="light">Jasny</option>
        <option value="dark">Ciemny</option>
      </select>
      <BaseButton color="blue" class="ml-2" @click="saveTheme"
        >Zapisz motyw</BaseButton
      >
    </div>
    <div class="mb-6">
      <label class="block font-semibold mb-1">Zmień hasło:</label>
      <input
        v-model="oldPassword"
        type="password"
        placeholder="Stare hasło"
        class="p-2 border rounded w-full mb-2"
      />
      <input
        v-model="newPassword"
        type="password"
        placeholder="Nowe hasło"
        class="p-2 border rounded w-full mb-2"
      />
      <input
        v-model="newPassword2"
        type="password"
        placeholder="Powtórz nowe hasło"
        class="p-2 border rounded w-full mb-2"
      />
      <BaseButton color="green" @click="changePassword">Zmień hasło</BaseButton>
      <div v-if="passwordMsg" class="mt-2 text-sm" :class="passwordMsgType">
        {{ passwordMsg }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import BaseButton from "@/components/BaseButton.vue";
import axios from "axios";
export default {
  components: { BaseButton },
  data() {
    return {
      theme: "light",
      oldPassword: "",
      newPassword: "",
      newPassword2: "",
      passwordMsg: "",
      passwordMsgType: "text-green-600",
    };
  },
  computed: {
    ...mapState(["user"]),
  },
  mounted() {
    this.theme = this.user.option || "light";
  },
  methods: {
    async saveTheme() {
      try {
        const token = sessionStorage.getItem("token");
        await axios.put(
          "/api/users/update",
          { option: this.theme },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        document.documentElement.setAttribute("data-theme", this.theme);
        this.passwordMsg = "Motyw zapisany!";
        this.passwordMsgType = "text-green-600";
      } catch {
        this.passwordMsg = "Błąd zapisu motywu.";
        this.passwordMsgType = "text-red-600";
      }
    },
    async changePassword() {
      this.passwordMsg = "";
      if (!this.oldPassword || !this.newPassword || !this.newPassword2) {
        this.passwordMsg = "Wypełnij wszystkie pola.";
        this.passwordMsgType = "text-red-600";
        return;
      }
      if (this.newPassword !== this.newPassword2) {
        this.passwordMsg = "Nowe hasła nie są takie same.";
        this.passwordMsgType = "text-red-600";
        return;
      }
      try {
        const token = sessionStorage.getItem("token");
        await axios.put(
          "/api/users/update",
          {
            changePassword: true,
            oldPassword: this.oldPassword,
            newPassword: this.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.passwordMsg = "Hasło zmienione!";
        this.passwordMsgType = "text-green-600";
        this.oldPassword = "";
        this.newPassword = "";
        this.newPassword2 = "";
      } catch (e) {
        this.passwordMsg = "Błąd zmiany hasła.";
        this.passwordMsgType = "text-red-600";
      }
    },
  },
};
</script>
