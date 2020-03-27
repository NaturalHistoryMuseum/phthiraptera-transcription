const Bundler = require('parcel-bundler');
const routes = require('../src/routes').values();
const { writeManifest } = require('../src/manifest');

const isDevMode = process.env.NODE_ENV !== 'production';

/**
 * Returns a new instance of the bundler
 * @param {string} target browser or node
 * @param {string[]} routes entry points for bundler
 * @param {bool} watch true to rebuild on file changes
 */
function getBundler(target, routes, watch = isDevMode) {
    const bundler = new Bundler(routes, {
    outDir: './dist/' + target,
    target,
    watch,
    global: target === 'browser' ? 'component' : null
  })
  return bundler;
}

/**
 * Create a build for node
 * @param {bool} watch Whether to watch for fs changes
 */
function buildNode(watch = isDevMode) {
  const bundler = getBundler('node', routes, watch);
  if(watch) {
    return new Promise(resolve => {
      bundler.on('bundled', bundle => {
        console.log('Node rebuilt');
        delete require.cache[bundle.name];
        resolve(bundle);
      });
      bundler.bundle();
    });
  }

  return bundler.bundle();
}

/**
 * Create a bundle for the browser
 * @param {bool} watch Whether to watch for fs changes
 */
async function buildClient(watch = isDevMode) {
  const b = getBundler('browser', [...routes, require.resolve('../src/client/index.js')], watch);
  const r = await b.bundle();
  b.on('bundled', () => console.log('Client rebuilt'));
  return r;
}

/**
 * Create all of the builds and write the manifest
 * @param {bool} watch Whether to watch fs for changes
 */
async function build(watch = isDevMode) {
  const bundles = [
    await buildNode(watch),
    await buildClient(watch)
  ]

  const [node, browser] = bundles;

  writeManifest({ node, browser });

  return bundles;
}

module.exports = build;

if(require.main === module) {
  build()
  .catch(
    e => {
      console.error(e);
      process.exit(1);
    }
  )
}
