<template>
  <AppWrapper class="App__wrapper">
    <Transcription class="App__transcription" :records="recordState" :collections="collections" :action="action" :email="email"></Transcription>
    <div class="App__progress">
      <div class="App__progress-label">{{ records.completed }}/{{ records.total }}</div>
      <progress :max="records.total" :value="records.completed" class="App__progress-bar"></progress>
    </div>
  </AppWrapper>
</template>

<script>
import Vue from 'vue';
import AppWrapper from '../components/AppWrapper.vue';
import Transcription from '../components/Transcription.vue';

const eventBus = new Vue();

export default {
  mounted(){
    if(history.state) {
      this.historyState = history.state;
    }
  },
  data(){
    return { historyState: null };
  },
  computed: {
    recordState() {
      return this.history || this.records;
    }
  },
  components: {
    AppWrapper,
    Transcription
  },
  provide: {
    eventBus
  },
  name: 'app',
  props: ['records', 'collections', 'action', 'email'],
  /**
   * Load data from the API endpoint
   */
  async loadData(api, req){
    // Todo: Determine newness based on existing db records
    const isNew = req.query.get('new');
    const barcodes = req.query.getAll('barcode');
    const edit = !isNew && barcodes && barcodes.length;

    return {
      action: edit ? '/edit' : '/',
      records: await api.getAssets(barcodes, edit),
      collections: await api.getCollections(),
      email: req.cookies.email
    }
  }
}
</script>

<style>
.App__wrapper {
  overflow: hidden;
}

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
