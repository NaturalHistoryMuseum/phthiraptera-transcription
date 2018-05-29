const App = require('../components/App.vue').default
const Vue = require('vue').default

const app = new Vue({
  render: h => h(App, { props: { record: window.__DATA__ }})
})

app.$mount('#app')
