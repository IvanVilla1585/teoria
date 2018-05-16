'use strict'

const path = require('path')
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: {
    app: path.resolve(__dirname, 'public/app.js')
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: "css-loader",
        options: {
          root: '/public/css'
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'app.bundle.css',
      allChunks: true,
      publicPath: path.resolve(__dirname, 'public/css')
    }),
  ]
}