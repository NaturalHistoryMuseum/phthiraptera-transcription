const express = require('express');
const bodyParser = require('body-parser');
const Bundler = require('parcel-bundler');
const toCSV = require('array-to-csv')
const auth = require('./auth');
const { render, html, login }  = require('./render');
const api = require('./api');
const { nextAsset, saveTranscription, readData } = require('./api/database');
const RecursiveIterator = require('recursive-iterator');

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
    const data = await nextAsset({ multiple: req.query.multiple, empty: req.query.empty });
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

const JSONB_TYPE = 3802;
const pad = (a, n, string = '') =>
  Array.from(function*() {
    let i = 0;
    while(i < n) {
      yield i < a.length ? a[i] : string;
      i++;
    }
  }())
const flatMap = fn => a => a.reduce((acc, val) => acc.concat(fn(val)), []);

app.get('/csv', async (req, res, next) => {
  try {
    const data = await readData();

    // Some fields are JSON so we need to flatten them out before
    // converting to CSV

    // Find all column names
    const iterator = new RecursiveIterator(data.rows);
    const cols = new Set();

    for (const { path, node } of iterator) {
      if (!iterator.isLeaf(node)) continue;

      cols.add(path.slice(1).join('.'));
    }

    // Sort columns alphanumerically
    const colPaths = Array.from(cols).sort(
      (a, b) => {
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) {
          if (a[i] !== b[i]) {
            return a[i] < b[i] ? -1 : 1;
          }
        }

        return a.length - b.length;
      }
    );

    // Now map rows to their flattened counterparts using the column paths
    // Use null where no value is present
    const rows = data.rows.map(
      row => colPaths.map(
        path => path.split('.').reduce(
          (node, key) => key in Object(node) ? node[key] : null,
          row
        )
      )
    );

    res.type('text/csv; charset=utf-8; headers=present');
    res.send(toCSV([colPaths, ...rows]));
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
