const getenv = require('getenv');
const OrcidAuth = require('./orcid');
const port = getenv('PORT', '1234');
const host = getenv('HOST', `http://localhost:${port}`);
const redirectUri = `${host}/oauth`;
const oauthUrl = process.env.OAUTH_URL || 'https://orcid.org/oauth';

const orcid = new OrcidAuth({
  clientId: getenv('ORCID_CLIENT_ID', ''),
  clientSecret: getenv('ORCID_CLIENT_SECRET', ''),
  redirectUri,
  oauthUrl
});

module.exports = { orcid };
