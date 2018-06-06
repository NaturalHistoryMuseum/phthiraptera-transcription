<template>
  <AppWrapper>
    <Transcription class="App__transcription" :records="records" :error="error" />
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
