const {Router} = require('express');
const getenv = require('getenv');

const Auth = require('../api/auth');
const db = require('../api/database');
const auth = new Auth(getenv('JWT_KEY', 'test'));

const {orcid} = require('../api');
const { updateTranscriber } = db;

const app = new Router();

app.get('/oauth', async (req, res, next) => {
  try {
    const code = req.query.get('code');
    const body = await orcid.exchangeAuth(code);

    const { expires_in, orcid: id, name } = body;

    const user = {
      name,
      orcid: String(new URL('/' + id, orcid.oauthUrl))
    };

    if(req.cookies.email) {
      await updateTranscriber(req.cookies.email, user);
      res.clearCookie('email');
    }

    const token = await auth.sign(user, {
      expiresIn: expires_in
    });

    res.cookie('auth', token, {
      expires: new Date(Date.now() + (expires_in * 1000))
    });

    res.redirect('/');
  } catch(e) {
    console.error(e);
    next(e);
  }
})

app.use(async (req, res, next) => {
  if(req.path === '/login') {
    next();
    return;
  }

  try {
    const payload = await auth.verify(req.cookies.auth);
    req.user = {
      name: payload.name,
      orcid: payload.orcid
    };
    next();
  } catch(e) {
    if(Auth.isJwtError(e)) {
      res.redirect('/login');
    } else {
      next(e);
    }
  }
});

app.get('/logout', async(req, res) => {
  res.clearCookie('auth');
  res.redirect('/');
});


module.exports = app;
