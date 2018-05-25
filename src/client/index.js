const App = require('../components/App.vue').default
const Vue = require('vue').default

const app = new Vue(App)

app.$mount('#app')