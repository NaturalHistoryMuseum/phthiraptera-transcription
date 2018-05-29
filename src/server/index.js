const express = require('express');
const auth = require('./auth');
const render = require('./render');

const app = express();

app.use(auth);

app.use('/api', require('./api'));

app.use(express.static('dist'));

app.get('/', async (req, res) => {
  try {
    const html = await render();
    res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Anoplura Transcriptions</title>
  <link rel="stylesheet" href="/index.css" />
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
