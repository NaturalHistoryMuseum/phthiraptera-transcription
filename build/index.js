const buildAssets = require('./assets');
const runMigrations = require('./migrate');

module.exports = {
  buildAssets,
  runMigrations
}

if (require.main === module) {
  buildAssets();
  runMigrations();
}
