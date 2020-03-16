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
  }

  require('./src/server/index.js');
}

start().catch(
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
