const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    library: ['moment', 'xlsx', 'jspdf'],
  },
  output: {
    filename: '[name].dll.js',
    path: path.join(__dirname, '../library'),
    library: '[name]',
  },
  plugins: [
    new CleanWebpackPlugin({ root: path.resolve(__dirname, '../library') }),
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(__dirname, '../library/[name].json'),
    }),
  ],
};
