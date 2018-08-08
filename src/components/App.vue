<template>
  <AppWrapper>
    <Transcription class="App__transcription" :records="records" :error="error" />
    <div class="App__progress">
      <div class="App__progress-label">{{ records.completed }}/{{ records.total }}</div>
      <progress :max="records.total" :value="records.completed"></progress>
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
.App__progress {
  display: grid;
}

.App__progress-label {
  position: absolute;
  background: rgba(255,255,255, 0.5);
  left: 50%;
  transform: translateX(-50%);
}
</style>
