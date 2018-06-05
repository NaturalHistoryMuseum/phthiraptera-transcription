const Bundler = require('parcel-bundler');

const isDevMode = process.env.NODE_ENV !== 'production';

const run = () => {
  for (const name of ['App', 'Login']) {
    const src = require.resolve(`../src/components/${name}.vue`);

    const bundler = new Bundler(src, {
      target: 'node'
    })

    bundler.bundle();

    if(isDevMode) {
      bundler.on('bundled', bundle => {
        delete require.cache[bundle.name];
      });
    }
  }
}

module.exports = run;
