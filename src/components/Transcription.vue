<template>
  <div class="Transcription">
    <div class="Transcription__images">Transcription</div>
    <Form />
  </div>
</template>

<script>
import Form from './Form.vue';

export default {
  components: {
    Form
  }
}
</script>

<style>
.Transcription {
  padding: 15px;

  display: flex;
}

.Transcription__images {
  flex: 1;
}
</style>