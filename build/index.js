const buildAssets = require('./assets');
const runMigrations = require('./migrate');

module.exports = {
  buildAssets,
  runMigrations
}

if (require.main === module) {
  Promise.all([
    buildAssets(),
    runMigrations()
  ]).catch(
    e => {
      console.error(e)
      process.exit(1);
    }
  );
}
