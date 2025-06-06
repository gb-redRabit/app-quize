<template>
  <div class="quiz-container">
    <h1 class="text-2xl font-bold mb-4">Quiz</h1>
    <div v-if="loading" class="loading">Loading questions...</div>
    <div v-else>
      <div v-if="currentQuestionIndex < questions.length">
        <div class="question">
          <h2 class="text-xl">{{ questions[currentQuestionIndex].description }}</h2>
        </div>
        <div class="answers">
          <button
            v-for="(answer, index) in questions[currentQuestionIndex].answers"
            :key="index"
            @click="selectAnswer(index)"
            class="answer-button"
          >
            {{ answer }}
          </button>
        </div>
      </div>
      <div v-else>
        <h2 class="text-xl">Quiz Completed!</h2>
        <p>Your score: {{ score }} / {{ questions.length }}</p>
        <button @click="restartQuiz" class="restart-button">Restart Quiz</button>
      </div>
    </div>
    <Timer :time="time" @time-up="handleTimeUp" />
  </div>
</template>

<script>
import Timer from './Timer.vue';

export default {
  components: {
    Timer,
  },
  data() {
    return {
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      loading: true,
      time: 300, // 5 minutes
    };
  },
  created() {
    this.fetchQuestions();
  },
  methods: {
    async fetchQuestions() {
      try {
        const response = await fetch('/api/questions'); // Adjust the API endpoint as needed
        this.questions = await response.json();
        this.loading = false;
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    },
    selectAnswer(index) {
      if (index === this.questions[this.currentQuestionIndex].correctAnswer) {
        this.score++;
      }
      this.currentQuestionIndex++;
    },
    restartQuiz() {
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.time = 300; // Reset time
      this.fetchQuestions();
    },
    handleTimeUp() {
      alert('Time is up! Quiz completed.');
      this.currentQuestionIndex = this.questions.length; // End the quiz
    },
  },
};
</script>

<style scoped>
.quiz-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
.loading {
  text-align: center;
}
.question {
  margin-bottom: 20px;
}
.answer-button {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.answer-button:hover {
  background-color: #357ab8;
}
.restart-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #e94e77;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.restart-button:hover {
  background-color: #c6395a;
}
</style>