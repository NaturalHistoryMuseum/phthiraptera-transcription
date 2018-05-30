const express = require('express');
const bodyParser = require('body-parser');
const { nextAsset, saveTranscription } = require('./database')
const { Client } = require('pg');

const app = express.Router();

app.get('/', async (req, res, next) => {
  try {
    res.json(await nextAsset());
  } catch(e) {
    next(e)
  }
});

app.use(bodyParser.json());
app.post('/', async (req, res, next) => {
  try {
    res.json(await saveTranscription(req.body));
  } catch(e) {
    next(e)
  }
});

module.exports = app;
