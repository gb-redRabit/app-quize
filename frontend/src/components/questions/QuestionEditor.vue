<template>
  <form class="space-y-4" @submit.prevent="save" @keydown.ctrl.enter.prevent="save" @keydown.meta.enter.prevent="save">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100">
        Edycja pytania <span class="font-mono text-xs text-gray-500">ID {{ form.ID }}</span>
      </h2>
      <span class="text-xs text-gray-500 dark:text-gray-400">Zmiany zapisują się od razu w bazie</span>
    </div>

    <div>
      <label :for="fieldId('question')" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Treść pytania
      </label>
      <textarea
        :id="fieldId('question')"
        ref="questionField"
        v-model="form.question"
        rows="3"
        class="mt-1 w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
      ></textarea>
    </div>

    <fieldset>
      <legend class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Odpowiedzi (zaznacz poprawną)
      </legend>
      <div class="space-y-2">
        <div
          v-for="key in answerKeys"
          :key="key"
          class="flex items-start gap-2 p-2 rounded-lg border"
          :class="
            form[`answer_${key}`].isCorret
              ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30'
              : 'border-gray-200 dark:border-gray-700'
          "
        >
          <input
            :id="fieldId('correct-' + key)"
            type="radio"
            :name="`correct-${form.ID}`"
            :checked="form[`answer_${key}`].isCorret"
            class="mt-2.5 h-4 w-4 text-green-600 focus:ring-green-500"
            :aria-label="`Odpowiedź ${key.toUpperCase()} poprawna`"
            @change="setCorrect(key)"
          />
          <div class="flex-1 min-w-0">
            <label
              :for="fieldId('answer-' + key)"
              class="block text-xs font-semibold text-gray-500 dark:text-gray-400"
            >
              {{ key.toUpperCase() }}
            </label>
            <textarea
              :id="fieldId('answer-' + key)"
              v-model="form[`answer_${key}`].answer"
              rows="2"
              class="mt-0.5 w-full p-1.5 text-sm rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>
        </div>
      </div>
    </fieldset>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label :for="fieldId('category')" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Kategoria
        </label>
        <select
          :id="fieldId('category')"
          v-model="categoryChoice"
          class="mt-1 w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
          <option value="__new__">+ nowa kategoria…</option>
        </select>
        <input
          v-if="categoryChoice === '__new__'"
          v-model="newCategory"
          type="text"
          placeholder="Nazwa nowej kategorii"
          class="mt-2 w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          :aria-label="'Nazwa nowej kategorii'"
        />
      </div>

      <div>
        <label :for="fieldId('note')" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notatka
        </label>
        <input
          :id="fieldId('note')"
          v-model="form.note"
          type="text"
          placeholder="Opcjonalna notatka"
          class="mt-1 w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        />
      </div>
    </div>

    <div>
      <label :for="fieldId('description')" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Opis / podstawa prawna
      </label>
      <textarea
        :id="fieldId('description')"
        v-model="form.description"
        rows="2"
        class="mt-1 w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
      ></textarea>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input v-model="form.flagged" type="checkbox" class="h-4 w-4 rounded-sm" />
        Sprawdzone
      </label>
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input v-model="form.bad" type="checkbox" class="h-4 w-4 rounded-sm" />
        Złe
      </label>
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input v-model="form.unknown" type="checkbox" class="h-4 w-4 rounded-sm" />
        Nie wiem
      </label>
    </div>

    <div class="flex items-center justify-end gap-2 pt-2">
      <span class="mr-auto text-xs text-gray-400 dark:text-gray-500">Ctrl+Enter zapisuje</span>
      <BaseButton color="gray" type="button" @click="$emit('cancel')">Anuluj</BaseButton>
      <BaseButton color="blue" type="submit" :loading="saving">Zapisz zmiany</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['saved', 'cancel']);

const store = useStore();
const saving = ref(false);
const questionField = ref(null);
const newCategory = ref('');
const categoryChoice = ref('');
const form = ref(buildForm(props.question));

// Baza i backend obsługują wyłącznie odpowiedzi A–C.
const answerKeys = ['a', 'b', 'c'];

const categoryOptions = computed(() => {
  const list = store.getters['questions/getCategories'] || [];
  const current = form.value.category;
  const options = [...list];
  if (current && !options.includes(current)) options.unshift(current);
  return options.sort((a, b) => a.localeCompare(b));
});

function buildForm(question) {
  const clone = JSON.parse(JSON.stringify(question || {}));
  clone.answer_a = clone.answer_a || { answer: '', isCorret: false };
  clone.answer_b = clone.answer_b || { answer: '', isCorret: false };
  clone.answer_c = clone.answer_c || { answer: '', isCorret: false };
  // Edytor obsługuje tylko A–C — ewentualne D z danych nie jest wysyłane.
  delete clone.answer_d;

  // Ujednolicenie literówek w polu z bazy (`isCorret` w danych).
  for (const key of ['answer_a', 'answer_b', 'answer_c']) {
    if (clone[key] && clone[key].isCorrect) clone[key].isCorret = true;
  }

  clone.flagged = !!clone.flagged;
  clone.bad = !!clone.bad;
  clone.unknown = !!clone.unknown;
  clone.note = clone.note || '';
  return clone;
}

function fieldId(suffix) {
  return `inline-edit-${props.question?.ID || 'q'}-${suffix}`;
}

watch(
  () => props.question,
  (question) => {
    form.value = buildForm(question);
    newCategory.value = '';
    categoryChoice.value = form.value.category || '';
  }
);

watch(
  () => form.value.category,
  (category) => {
    if (categoryChoice.value !== '__new__') categoryChoice.value = category || '';
  }
);

watch(categoryChoice, (choice) => {
  if (choice !== '__new__') form.value.category = choice;
});

function setCorrect(key) {
  for (const k of ['a', 'b', 'c']) {
    const entry = form.value[`answer_${k}`];
    if (entry) entry.isCorret = k === key;
  }
}

nextTick(() => questionField.value?.focus());

async function save() {
  if (saving.value) return;

  if (categoryChoice.value === '__new__' && newCategory.value.trim()) {
    form.value.category = newCategory.value.trim();
  }

  const payload = { ...form.value };
  delete payload._id;
  delete payload.__v;
  delete payload.answer_d;

  saving.value = true;
  try {
    const res = await apiClient.put(`/questions/${props.question.ID}`, payload);
    emit('saved', res.data);
  } catch (e) {
    // apiClient pokazuje komunikat błędu; tutaj tylko log dla diagnostyki.
    console.error('Błąd zapisu pytania:', e);
  } finally {
    saving.value = false;
  }
}
</script>
