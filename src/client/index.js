const App = require('../components/App.vue').default
const Vue = require('vue').default

const eventBus = new Vue();

const app = new Vue({
  provide: {
    eventBus
  },
  data() {
    return {
      records: window.__DATA__,
      collections: window.__COLLECTIONS__,
      error: null
    }
  },
  render(h) {
    return h(
      App,
      {
        props: {
          records: this.records,
          collections: this.collections,
          error: this.error
        }
      }
    )
  }
})

// Listen for the form to fire transcribe event
eventBus.$on('transcribe', async ({ payload, target }) => {
  const formData = Array.from(new FormData(target).entries());

  // Save the form data in the history API so we can restore it later
  history.replaceState({ formData, records: app.records }, '');

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
    app.error = await res.json();

    Vue.nextTick(() => location.hash = '#errors');
    return;
  }

  // Get the next set of records
  const records = await(await window.fetch('/api', { credentials: 'include' })).json();

  // Push a new history state so the user can go back if needed
  history.pushState({ records }, '');

  if(payload.collection && !app.collections.includes(payload.collection)) {
    app.collections.push(payload.collection);
  }

  app.records = records;
  app.error = null;
});

// Restore the app state on history navigate
window.onpopstate = (event) => {
  app.records = event.state.records;
  app.error = null;
}

app.$mount('#app')
