<template>
  <div
    class="flex-1 relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 group"
    :class="{ 'ring-4 ring-blue-400': active }"
    @click="$emit('select')"
  >
    <div
      v-if="active"
      class="absolute top-3 right-3 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
    <div
      :class="{
        'bg-white border border-gray-200': themeName === 'light',
        'bg-gray-900 border border-gray-700': themeName === 'dark',
      }"
      class="shadow-sm transform group-hover:scale-105 transition-transform duration-300"
    >
      <div
        :class="{
          'bg-gray-100 border-gray-200': themeName === 'light',
          'bg-gray-800 border-gray-700': themeName === 'dark',
        }"
        class="border-b px-3 py-2 flex items-center gap-1.5"
      >
        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>
      <div class="p-4 space-y-2">
        <div class="h-2 w-16 bg-blue-500 rounded"></div>
        <div
          class="h-2 w-full rounded"
          :class="{ 'bg-gray-300': themeName === 'light', 'bg-gray-700': themeName === 'dark' }"
        ></div>
        <div
          class="h-2 w-2/3 rounded"
          :class="{ 'bg-gray-300': themeName === 'light', 'bg-gray-700': themeName === 'dark' }"
        ></div>
      </div>
      <div
        class="p-3 text-center text-sm font-medium"
        :class="{
          'bg-gray-50 border-t border-gray-200 text-gray-700': themeName === 'light',
          'bg-gray-800 border-t border-gray-700 text-gray-300': themeName === 'dark',
        }"
      >
        {{ title }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  active: Boolean,
  themeName: String,
  title: String,
});

defineEmits(['select']);
</script>
