const VueLoaderPlugin = require('vue-loader/lib/plugin')
const publicPath = require('../../package.json').config.publicPath;

module.exports = {
  mode: 'none',
  output: {
    filename: '[name].[hash].bundle.js',
    publicPath
  },
  resolve: {
    extensions: ['.js', '.json', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: "file-loader"
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}
