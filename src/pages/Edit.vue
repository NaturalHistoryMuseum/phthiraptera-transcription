<template>
  <AppWrapper class="App__wrapper">
    <!--Transcription class="App__transcription" :records="records" :error="error" :collections="collections"></Transcription-->
		Barcodes: {{ barcodes }},
		<div style="display: flex; flex-wrap: wrap;">
      <Field  v-for="(val, key) in records[0]" :key="key" :label="key" v-slot="{ vModel, disabled }" :value="records.every(r => r[key] === val) ? val : multiple">
        <input :disabled="disabled" v-model="vModel.value">
      </Field>
    </div>

  </AppWrapper>
</template>

<script>
import Vue from 'vue';
import AppWrapper from '../components/AppWrapper.vue';
import Transcription from '../components/Transcription.vue';
import Field from '../components/Field.vue';

export default {
  components: {
    AppWrapper,
    Transcription,
    Field
  },
  name: 'edit',
  props: ['barcodes', 'records'],
  data(){
    return {
      multiple: Field.multiple
    }
  },
  /**
   * Load data from the API endpoint
   */
  async loadData(api, req){
		const barcodes = req.query.getAll('barcode');

    return {
			barcodes,
			records: await api.getTranscriptions(barcodes)
    }
  }
}
</script>
