const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const getenv = require('getenv');

const verifyJwt = (token, hash) => {
  try {
    jwt.verify(token, hash);
    return true;
  } catch(e) {
    return false;
  }
}

const hash = getenv('PW_HASH', '');

module.exports = fallback => {
  if (!hash) {
    return (req, res, next) => next();
  }

  const app = express.Router();

  app.use(cookieParser());

  app.post('/', async (req, res, next) => {
    if (!('password' in req.body)) {
      next();
      return;
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

  app.use(async (req, res, next) => {
    if (verifyJwt(req.cookies.token, hash)) {
      next();
      return;
    }

    try {
      await fallback(req, res, next);
    } catch(e) {
      next(e);
    }
  });

  return app;
}
