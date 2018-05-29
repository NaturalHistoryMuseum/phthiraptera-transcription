<template>
  <div class="Transcription">
    <TImage class="Transcription__images" :src="record.asset_id" />
    <Form />
  </div>
</template>

<script>
import Form from './Form.vue';
import TImage from './Image.vue';

export default {
  components: {
    Form,
    TImage
  },
  props: ['record']
}
</script>

<style>
.Transcription {
  padding: 15px;

  display: flex;
}

.Transcription > * {
  flex: 1 1 50%;
}
</style>
