<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  msg: {
    type: String,
    required: true,
  },
})

// Reactive state for the button click counter
const clickCount = ref(0)

// Handler function for incrementing the count
function incrementCounter() {
  clickCount.value += 1
}
</script>

<template>
  <section>
    <h1>{{ props.msg }}</h1>

    <div class="card">
      <button @click="incrementCounter">
        You clicked {{ clickCount }} time<span v-if="clickCount !== 1">s</span>
      </button>
      <p>
        To test hot module replacement, edit
        <code>components/HelloWorld.vue</code> and save.
      </p>
    </div>

    <footer>
      <p>
        Curious about Vue + Vite? Explore the
        <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank" rel="noopener noreferrer">
          official starter guide
        </a>.
      </p>
      <p>
        For advanced usage, check the
        <a href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support" target="_blank" rel="noopener noreferrer">
          IDE support docs
        </a>.
      </p>
    </footer>

    <p class="read-the-docs">Click on the Vite and Vue logos above to learn more.</p>
  </section>
</template>

<style scoped>
.read-the-docs {
  color: #888;
  font-style: italic;
}

.card {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

button {
  background-color: #7F56D9;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #6941C6;
}
</style>
