const tpl = require('../../dist/App.js').default
const Vue = require('vue')

// Step 2: Create a renderer
const renderer = require('vue-server-renderer').createRenderer()

module.exports = ({data}) => {
  return renderer.renderToString(new Vue({
  render: h => h(tpl, { props: { record: data } })
}))}
