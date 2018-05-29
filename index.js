if (process.env.NODE_ENV !== 'production') {
  require('./dev')
}

require('./src/server/index.js');
