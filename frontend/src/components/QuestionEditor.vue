<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">Question Editor</h2>
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label for="question" class="block text-sm font-medium text-gray-700">Question</label>
        <input type="text" v-model="question" id="question" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
      </div>
      <div class="mb-4">
        <label for="answerA" class="block text-sm font-medium text-gray-700">Answer A</label>
        <input type="text" v-model="answerA" id="answerA" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
      </div>
      <div class="mb-4">
        <label for="answerB" class="block text-sm font-medium text-gray-700">Answer B</label>
        <input type="text" v-model="answerB" id="answerB" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
      </div>
      <div class="mb-4">
        <label for="answerC" class="block text-sm font-medium text-gray-700">Answer C</label>
        <input type="text" v-model="answerC" id="answerC" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
      </div>
      <div class="mb-4">
        <label for="answerD" class="block text-sm font-medium text-gray-700">Answer D</label>
        <input type="text" v-model="answerD" id="answerD" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
      </div>
      <div class="mb-4">
        <label for="correctAnswer" class="block text-sm font-medium text-gray-700">Correct Answer</label>
        <select v-model="correctAnswer" id="correctAnswer" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md">Save Question</button>
    </form>
    <div v-if="message" class="mt-4 text-green-600">{{ message }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      question: '',
      answerA: '',
      answerB: '',
      answerC: '',
      answerD: '',
      correctAnswer: 'A',
      message: ''
    };
  },
  methods: {
    async handleSubmit() {
      const newQuestion = {
        question: this.question,
        answers: {
          A: this.answerA,
          B: this.answerB,
          C: this.answerC,
          D: this.answerD
        },
        correctAnswer: this.correctAnswer
      };
      try {
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newQuestion)
        });
        if (response.ok) {
          this.message = 'Question saved successfully!';
          this.resetForm();
        } else {
          this.message = 'Failed to save question.';
        }
      } catch (error) {
        this.message = 'Error: ' + error.message;
      }
    },
    resetForm() {
      this.question = '';
      this.answerA = '';
      this.answerB = '';
      this.answerC = '';
      this.answerD = '';
      this.correctAnswer = 'A';
    }
  }
};
</script>

<style scoped>
</style>