<template>
  <AppWrapper>
    <Transcription class="App__transcription" :records="records" :error="error" :collections="collections"></Transcription>
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

/**
 * Listen for the transcribe event, submit stuff to the server
 * and modify the history object
 */
function onMount(){
  // Maybe want to refactor this at some point?
  // Either use global state or Page-component state
  const app = this.$root;

  // Listen for the form to fire transcribe event
  eventBus.$on('transcribe', async ({ payload, target }) => {
    const formData = Array.from(new FormData(target).entries());

    // Save the form data in the history API so we can restore it later
    history.replaceState({ formData, records: app.data.records }, '');

    // Save the data to database
    const res = await window.fetch('/api', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      app.data.error = await res.json();

      Vue.nextTick(() => location.hash = '#errors');
      return;
    }

    // Get the next set of records
    const records = await(await window.fetch('/api', { credentials: 'include' })).json();

    // Push a new history state so the user can go back if needed
    history.pushState({ records }, '');

    if(payload.collection && !app.data.collections.includes(payload.collection)) {
      app.data.collections.push(payload.collection);
    }

    app.data.records = records;
    app.data.error = null;
  });

  // Restore the app state on history navigate
  window.onpopstate = (event) => {
    app.data.records = event.state.records;
    app.data.error = null;
  }
}

export default {
  mounted: onMount,
  components: {
    AppWrapper,
    Transcription
  },
  provide: {
    eventBus
  },
  name: 'app',
  props: ['records', 'error', 'collections'],
  /**
   * Load data from the API endpoint
   */
  async loadData(api, req){
    return {
      records: await api.nextAsset({ multiple: req.query.multiple, empty: req.query.empty }),
      collections: await api.getCollections(),
      error: null
    }
  }
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
