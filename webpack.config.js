const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

/*
 * Webpack config file to create bundle for embedded online visualizations.
 */
module.exports = {
  entry: './src/index.web.js',
  output: {
    filename: 'ta-visualizations.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin(),
    new CopyWebpackPlugin([
      { from: 'public/data', to: 'data/' },
      'public/ta-visualizations.css'
    ])
  ]
}
