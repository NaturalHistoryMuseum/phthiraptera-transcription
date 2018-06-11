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
  
    // List of field names
    const fieldNames = [],
          arrayFields = []

    for (const field of data.fields) {
      fieldNames.push(field.name);

      if (field.dataTypeID === JSONB_TYPE) {
        arrayFields.push(field.name)
      }
    }

    const colSizes = data.rows.reduce((colSizes, row) => {
      for (const i of arrayFields) {
        colSizes[i] = Math.max(colSizes[i] || 0, row[i].length)
      }
      return colSizes;
    }, {});

    const rows = data.rows.map(row => {
      const newRow = [];

      for(const field of fieldNames) {
        if (field in colSizes) {
          const pad = Math.max(colSizes[field] - row[field].length, 0);
          newRow.push(...row[field], ...Array(pad))
        } else {
          newRow.push(row[field])
        }
      }

      return newRow;
    });

    const cols = fieldNames.reduce(
      (cols, fieldName) => cols.concat(
        fieldName in colSizes ?
          Array(colSizes[fieldName]).fill(fieldName).map((el, ix) => `${el}[${ix}]`)
          : fieldName
      ),
      []
    )

    res.type('text/csv; charset=utf-8; headers=present');
    res.send(toCSV([cols, ...rows]));
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
