const webpack = require('webpack');
const rimraf = require('rimraf');
const serverConfig = require('./webpack.server.config');
const clientConfig = require('./webpack.client.config');

const compiler = webpack(
  [
    serverConfig,
    clientConfig
  ]
);

// Clear the build directory
const clear = () => new Promise(res => rimraf(serverConfig.output.path, res));

/**
 * Create a callback for the compile functions. Just outputs stuff to terminal.
 * @param {Function} resolve Function to call when the hurlyburly's done
 */
const compilerCb = resolve => (err, stats) => {
  if (err) {
    console.error(err);
    return err;
  }

  console.log(stats.toString({
    chunks: false,  // Makes the build much quieter
    colors: true    // Shows colors in the console
  }));
  resolve();
}

/**
 * Run the compiler
 * @param {Boolean} watch True to rebuild when files change
 */
async function build(watch = (process.env.NODE_ENV !== 'production')) {
  await clear();

  return new Promise((resolve, reject) => {
    const handler = compilerCb(resolve);
    if(watch) {
      compiler.watch({}, handler);
    } else {
      compiler.run((...args) => {
        const err = handler(...args);
        if(err) {
          reject(err);
        }
      });
    }
  });
}

module.exports = build;

if(require.main === module) {
  build()
  .catch(
    e => {
      process.exit(1);
    }
  )
}
