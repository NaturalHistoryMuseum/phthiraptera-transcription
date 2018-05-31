const express = require('express');
const bodyParser = require('body-parser');
const Bundler = require('parcel-bundler');
const auth = require('./auth');
const render = require('./render');
const api = require('./api');
const { nextAsset, saveTranscription } = require('./api/database');

const app = express();

const bundler = new Bundler('src/client/index.js', {
  watch: true
});

app.use(bundler.middleware())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(auth);

app.use('/api', api);

app.post('/', async (req, res, next) => {
  try {
    await saveTranscription(req.body);
  } catch(e) {
    next(e);
    return;
  }

  res.redirect('/');
})

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
