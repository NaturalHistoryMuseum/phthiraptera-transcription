const express = require('express');
const bodyParser = require('body-parser');
const toCSV = require('csv-stringify')
const RecursiveIterator = require('recursive-iterator');
const cookieParser = require('cookie-parser');
const path = require('path');
const getenv = require('getenv');
const { orcid } = require('./api');
const render  = require('./render');
const db = require('./api/database');
const { release } = require('./api/database');
const { ValidationError } = require('./validator');
const auth = require('./routes/auth');
const config = require('../../package.json').config;

const port = getenv('PORT', '1234');
const { saveTranscription, readData, updateTranscriptions, getNextBarcode } = db;
const app = express();

app.set('query parser', q => new URLSearchParams(q));

app.use(config.publicPath, express.static(path.resolve(config.outputPath)))
app.use(express.static('src/data'))
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.text());
app.use(cookieParser());

app.post('/api/release', (req, res) => {
  release(req.body);
  res.sendStatus(204);
})

const redirect = (req, res, loc) => {
  res.location(loc);
  if(req.accepts('html', 'json') !== 'json') {
    res.statusCode = 302;
  }
}

app.use(auth);

// Handle form submission
app.post('/', async (req, res, next) => {
  try {
    await saveTranscription(req.body, req.user);
  } catch(e) {
    next(e);
    return;
  }

  redirect(req, res, '/');
  res.json(await db.getAssets(req.body.barcode, false));
})

app.post('/edit', async (req, res, next) => {
  try {
    await updateTranscriptions(req.body, req.user);
  } catch(e) {
    next(e);
    return;
  }

  redirect(req, res, '/browse');
  res.json(await db.getAssets(req.body.barcode, true));
});

app.get('/asset/:id', async (req, res, next) => {
  const assetId = req.param('id');
  const url = `https://api.gbif.org/v1/image/unsafe/https://www.nhm.ac.uk/services/media-store/asset/${assetId}/contents/preview`;
  require('https').get(url,
    proxyRes => {
      if(proxyRes.statusCode >= 400){
        res.status(proxyRes.statusCode);
      }
      proxyRes.pipe(res);
    }
  );
});

app.get('/', async (req, res, next) => {
  const barcodes = req.query.getAll('barcode');
  if(!barcodes || !barcodes.length) {
    const nextBarcode = await getNextBarcode();
    res.redirect('/?new=1&barcode='+nextBarcode);
    return;
  }

  next();
});

app.use((error, req, res, next) => {
  if(req.accepts(['html', 'json']) === 'json') {
    switch (true) {
      case error instanceof ValidationError:
        res.status(400).json(error.errors);
        break;
      default:
        res.status(500).json([
          error.message
        ])
    }
  }
})

// Route for all components
app.get('*', async (req, res, next) => {
  try {
    const url = req.path;
    const misc = {
      get oauthUrl() {
        return orcid.getAuthUrl();
      }
    };
    const page = await render(url, async Component => Component.loadData ? await Component.loadData(db, req, misc) : null, 'Phthiraptera Transcriptions');

    if(!page) {
      next();
      return;
    }

    res.send(page);
  } catch (e) {
    next(e);
  }
});

const escapeNewlines = value => typeof value === 'string' ? value.replace(/\n/g, '↵') : value;

app.get('/csv', async (req, res, next) => {
  if (!process.env.CSV_DOWNLOAD) {
    res.status(451).send('Disabled for data protection reasons.');
    return;
  }

  try {
    const data = await readData();

    // Some fields are JSON so we need to flatten them out before
    // converting to CSV

    // Find all column names
    const iterator = new RecursiveIterator(data);
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
    const rows = data.map(
      row => colPaths.map(
        path => path.split('.').reduce(
          (node, key) => key in Object(node) ? escapeNewlines(node[key]) : null,
          row
        )
      )
    );

    const now = new Date;
    res.set({
      'Content-Disposition': `attachment; filename=phthiraptera-export-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.csv`
    });
    res.type('text/csv; charset=utf-8; headers=present');
    const records = await new Promise((resolve, reject) => toCSV([colPaths, ...rows], { delimiter: ';' }, (err, res) => {
      if(err) {
        return reject(err);
      }

      resolve(res);
    }));

    res.send(records);
  } catch(e) {
    next(e);
  }
})

app.use((req, res) => {
  res.status(404).send('File not found');
});

app.listen(port, () => {
  console.log('Listening on http://localhost:' + port)
});
