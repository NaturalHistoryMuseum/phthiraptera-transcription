const tpl = require('../../dist/App.js').default
const Vue = require('vue')
const app = new Vue(tpl)

// Step 2: Create a renderer
const renderer = require('vue-server-renderer').createRenderer()

module.exports = () => renderer.renderToString(app)