const Vue = require('vue')

const renderer = require('vue-server-renderer').createRenderer()

module.exports = ({data}) => {
  const App = require('../../dist/App.js').default;

  return renderer.renderToString(
    new Vue({
      render: h => h(App, { props: { record: data } })
    })
  )
}
