<template>
  <div class="flex items-center justify-center">
    <div class="text-2xl font-bold" v-if="timeLeft > 0">
      Time Left: {{ timeLeft }} seconds
    </div>
    <div class="text-2xl font-bold" v-else>
      Time's up!
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      timeLeft: 150, // Set the timer for 150 seconds
      timer: null,
    };
  },
  mounted() {
    this.startTimer();
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.timer);
          this.$emit('time-up'); // Emit an event when time is up
        }
      }, 1000);
    },
  },
};
</script>

<style scoped>
</style>