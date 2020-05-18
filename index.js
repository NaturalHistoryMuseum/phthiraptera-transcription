const isDevMode = process.env.NODE_ENV !== 'production';

if (!isDevMode) {
  require('getenv').disableFallbacks();
}

const start = async () => {
  if (isDevMode) {
    const { buildAssets, runMigrations } = require('./build');
    await buildAssets();
    await require('./dev/docker')();
    await runMigrations();

    // Set up a mock oauth server
    const server = await require('./dev/oauth-server')();
    process.env.OAUTH_URL = server.issuer.url;
    console.log('Oauth server listening on', process.env.OAUTH_URL);
  }

  require('./src/server/index.js');
}

start().catch(
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
