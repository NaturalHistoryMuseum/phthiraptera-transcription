const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const DEV_MODE = process.env.NODE_ENV !== 'production';

const env = (key, fallback) => {
  if (key in process.env) {
    return process.env[key];
  }
  if (!DEV_MODE || fallback === undefined) {
    throw new Error(`The ${key} environment variable has not been set.`);
  }

  return fallback;
}

const hash = env('PW_HASH', '$2b$10$hSvCHrEyrJBnMkfiZRTk0euWf0zuMqKA8iD7QFEgGwg6kZX8f44ye');

const app = express.Router();

app.use(cookieParser());

app.post('/', async (req, res, next) => {
  if (!('password' in req.body)) {
    next();
  }

  try {
    // More complex than it needs to be with single-user
    // but will help if/when expanding to multi-user
    if (!await bcrypt.compare(req.body.password, hash)) {
      throw new Error('Incorrect password');
    }

    // Sign with the hash so that the key expires when the password is changed
    // Todo: expiration?
    const key = await jwt.sign({}, hash);

    res.cookie('token', key, {
      expires: new Date(Date.now() + (1000 * 3600 * 24 * 365))
    })

    res.redirect('/');
  } catch(e) {
    next(e);
  }
});

app.use((req, res, next) => {
  try {
    jwt.verify(req.cookies.token, hash);
    next();
  } catch(e) {
    res.send('<form method="post"><input name="password" autofocus><button>Go</button></form>');
  }
});

module.exports = app;
