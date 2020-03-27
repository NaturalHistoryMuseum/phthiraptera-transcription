const Vue = require('vue').default

const Page = window.component.default;

const app = new Vue({
  data() {
    return {
      data: window.__DATA__,
      error: null
    }
  },
  render(h) {
    return h(
      Page,
      {
        props: {
          error: this.error,
          ...this.data
        }
      }
    )
  }
})

app.$mount('#app');
