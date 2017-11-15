const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

/*
 * Webpack config file to create separate bundles for each map or chart.
 * 
 * CommonsChunkPlugin creates a bundle of the commonly invoked modules, and we 
 * create a separate bundle for each map or chart.
 */
module.exports = {
  entry: {
    ch1map: './src/index.web.js'
  },
  output: {
    filename: 'web.bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015']
          }
        }
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin(),
    new CopyWebpackPlugin([
      'public'
    ])
  ]
}
