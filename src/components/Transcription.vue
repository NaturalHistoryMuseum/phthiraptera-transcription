<template>
  <div class="Transcription">
    <div class="Transcription__images">
      <TImage v-for="record in records" :src="record.asset_id" :key="record.asset_id" />
    </div>
    <Form :barcode="records[0].barcode" />
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
  props: ['records']
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

.Transcription__images {
  display: flex;
  flex-direction: column;
}

.Transcription__images > * {
  flex: 1;
}
</style>
