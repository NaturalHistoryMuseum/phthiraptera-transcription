const express = require('express');
const auth = require('./auth');
const render = require('./render');
const { app: api, nextAsset } = require('./api');

const app = express();

app.use(auth);

app.use('/api', api);

app.use(express.static('dist'));

app.get('/', async (req, res, next) => {
  try {
    const data = await nextAsset();
    const html = await render({ data });
    res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Anoplura Transcriptions</title>
  <link rel="stylesheet" href="/index.css" />
  <script>
    window.__DATA__ = ${JSON.stringify(data)};
  </script>
</head>

<body>
  ${html}
  <script src="/index.js"></script>
</body>
</html>`);
  } catch(e) {
    next(e);
  }
});

app.use((req, res) => {
    res.status(404).send('File not found');
});

app.listen(process.env.PORT || 1234);
