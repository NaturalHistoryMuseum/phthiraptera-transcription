const Vue = require('vue')

const renderer = require('vue-server-renderer').createRenderer()

module.exports.render = ({data}) => {
  const App = require('../../dist/App.js').default;

  return renderer.renderToString(
    new Vue({
      render: h => h(App, { props: { records: data } })
    })
  )
}

module.exports.login = () => {
  const Login = require('../../dist/Login.js').default;

  return renderer.renderToString(
    new Vue({
      render: h => h(Login)
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
