const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'none',
  output: {
    filename: '[name].[hash].bundle.js',
    publicPath: '/static/'
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
