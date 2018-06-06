const express = require('express');
const bodyParser = require('body-parser');
const { nextAsset, saveTranscription } = require('./database')
const { Client } = require('pg');
const { ValidationError } = require('../validator');

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

app.use((error, req, res, next) => {
  switch (true) {
    case error instanceof ValidationError:
      res.status(400).json(error.errors);
      break;
    default:
      next(error);
  }
})

module.exports = app;
