<template>
  <AppWrapper>
    <Transcription class="App__transcription" :records="records" :error="error"></Transcription>
    <div class="App__progress">
      <div class="App__progress-label">{{ records.completed }}/{{ records.total }}</div>
      <progress :max="records.total" :value="records.completed" class="App__progress-bar"></progress>
    </div>
  </AppWrapper>
</template>

<script>
import AppWrapper from './AppWrapper.vue';
import Transcription from './Transcription.vue';

export default {
  components: {
    AppWrapper,
    Transcription
  },
  name: 'app',
  props: ['records', 'error']
}
</script>

<style>
.App__transcription {
  flex-grow: 1;
}

.App__progress {
  display: grid;
  flex-grow: 0;
  flex-shrink: 1;
}

.App__progress-label {
  position: absolute;
  background: rgba(255,255,255, 0.5);
  left: 50%;
  transform: translateX(-50%);
}

.App__progress-bar {
  -webkit-appearance: none;
  width:100%;
}

.App__progress-bar::-webkit-progress-value {
  background-color: #69F;
}
</style>
