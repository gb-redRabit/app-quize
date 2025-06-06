<template>
  <div class="flex flex-col items-center justify-center bg-gray-100">
    <div
      class="bg-white/80 rounded-2xl flex flex-col items-center max-w-lg w-full"
    >
      <h1
        class="text-5xl font-extrabold mb-4 text-blue-700 tracking-tight drop-shadow-lg text-center"
      >
        Quiz App
      </h1>
      <p class="text-lg mb-8 text-gray-700 text-center">
        Sprawdź swoją wiedzę w nowoczesnym quizie! Wybierz tryb i zacznij już
        teraz.
      </p>
      <div class="w-full mb-4">
        <label class="block mb-2 text-gray-700 font-medium text-center">
          Ile pytań chcesz w quizie?
        </label>
        <select
          v-model="selectedLength"
          class="w-full p-2 rounded border border-gray-300 text-lg"
        >
          <option
            v-for="n in [10, 20, 50, 100, 150, 200, 250]"
            :key="n"
            :value="n"
          >
            {{ n }}
          </option>
        </select>
      </div>
      <router-link
        :to="{ name: 'QuizView', query: { length: selectedLength } }"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-xl font-semibold shadow transition mb-4 text-center"
      >
        Rozpocznij Quiz
      </router-link>
      <router-link
        to="/exam"
        class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-lg font-semibold shadow transition mb-4 text-center"
      >
        Egzamin 150 pytań (1h)
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      selectedLength: 10,
    };
  },
};
</script>

<style scoped></style>
