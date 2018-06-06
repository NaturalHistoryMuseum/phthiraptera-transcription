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
      error: null
    }
  },
  render(h) {
    return h(
      App,
      {
        props: {
          records: this.records,
          error: this.error
        }
      }
    )
  }
})

eventBus.$on('transcribe', async payload => {
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
    return;
  }

  const records = await(await window.fetch('/api', { credentials: 'include' })).json();

  app.records = records;
  app.error = null;
})

app.$mount('#app')
