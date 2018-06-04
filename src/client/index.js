const App = require('../components/App.vue').default
const Vue = require('vue').default

const eventBus = new Vue();

const app = new Vue({
  provide: {
    eventBus
  },
  data() {
    return {
      records: window.__DATA__
    }
  },
  render(h) {
    return h(App, { props: { records: this.records }})
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
    throw new Error('Res was not ok');
  }

  const record = await(await window.fetch('/api', { credentials: 'include' })).json();

  app.record = record;
})

app.$mount('#app')
