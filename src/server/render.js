const Vue = require('vue')

const renderer = require('vue-server-renderer').createRenderer()

module.exports.render = (Page, props) => {
  return renderer.renderToString(
    new Vue({
      render: h => h(Page, { props })
    })
  )
}

module.exports.html = ({ title, head, body }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  ${head}
</head>

<body>
  ${body}
</body>
</html>`
