<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Panel administratora</h1>
    <div v-if="!isAdmin" class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
      Brak uprawnień do wyświetlenia tej strony.
    </div>
    <div v-else>
      <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Zarejestrowani użytkownicy
      </h2>
      <table class="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <thead>
          <tr class="bg-blue-50 dark:bg-blue-900 text-left">
            <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Login</th>
            <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Avatar</th>
            <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Kolor avatara</th>
            <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Rola</th>
            <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user._id"
            class="border-b border-gray-200 dark:border-gray-700"
          >
            <td class="px-4 py-2">{{ user.login }}</td>
            <td class="px-4 py-2">
              <Avatar :avatar-index="user.avatar" :color="user.avatarColors" :size="32" />
            </td>
            <td class="px-4 py-2">{{ user.avatarColors }}</td>
            <td class="px-4 py-2">
              <span
                :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full':
                    user.rola === 'admin',
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 rounded-full':
                    user.rola !== 'admin',
                }"
              >
                {{ user.rola }}
              </span>
            </td>
            <td class="px-4 py-2">
              <select
                v-model="user.rola"
                @change="changeRole(user)"
                class="rounded px-2 py-1 border bg-gray-50 dark:bg-gray-900 dark:text-gray-200"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="users.length === 0" class="text-gray-500 dark:text-gray-400 mt-6 text-center">
        Brak zarejestrowanych użytkowników.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';
import Avatar from '@/components/Avatar.vue';

const store = useStore();
const currentUser = computed(() => store.getters['user/getUser']);
const isAdmin = computed(() => currentUser.value?.rola === 'admin');
const users = ref([]);

onMounted(async () => {
  if (!isAdmin.value) return;
  try {
    const res = await apiClient.get('/users/all');
    users.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    users.value = [];
  }
});

// Zmiana roli użytkownika
async function changeRole(user) {
  try {
    await apiClient.put(`/users/${user._id}/role`, { rola: user.rola });
  } catch (e) {}
}
</script>
