const express = require('express');
const bodyParser = require('body-parser');
const Bundler = require('parcel-bundler');
const toCSV = require('array-to-csv')
const auth = require('./auth');
const { render, html, login }  = require('./render');
const api = require('./api');
const { nextAsset, saveTranscription, readData } = require('./api/database');

const app = express();

const bundler = new Bundler('src/client/index.js', {
  // TODO: Debug minification/fille issue with parcel
  minify: false
});

app.use(bundler.middleware())
app.use(express.static('src/data'))
app.use(bodyParser.urlencoded({ extended: true }));

app.use(auth(async (req, res) => {
  res.send(html({
    title: 'Phthiraptera Transcriptions',
    head: `
      <link rel="stylesheet" href="/index.css" />
      <link rel="stylesheet" href="/Login.css" />
    `,
    body: await login()
  }));
}));

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
    res.send(html({
      title: 'Phthiraptera Transcriptions',
      head: `
        <link rel="stylesheet" href="/index.css" />
        <script>
          window.__DATA__ = ${JSON.stringify(data)};
        </script>`,
      body: `
        ${await render({ data })}
        <script src="/index.js"></script>`
    }));
  } catch(e) {
    next(e);
  }
});

app.get('/csv', async (req, res, next) => {
  try {
    const data = await readData();
    const fields = data.fields.map(f => f.name);
    const rows = [fields, ...data.rows.map(r => fields.map(f => r[f]))];
    res.type('text/csv; charset=utf-8; headers=present');
    res.send(toCSV(rows));
  } catch(e) {
    next(e);
  }
})

app.use((req, res) => {
    res.status(404).send('File not found');
});

const port = process.env.PORT || 1234;

app.listen(port, () => {
  console.log('Listening on http://localhost:' + port)
});
