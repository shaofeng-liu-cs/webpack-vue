/*
 * @Author: your name
 * @Date: 2020-04-09 16:25:55
 * @LastEditTime: 2021-09-07 09:42:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design-web\build\webpack.prod.conf.js
 */
const path = require('path');
// const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
// const utils = require('./style-util');
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin'); // 分析包速度
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer'); // 分析包体积
const baseWebpackConfig = require('./webpack.base.conf');

// const appConfigUrl = process.env.PROJECT ? '../src/' + process.env.PROJECT : '../src';
const smp = new SpeedMeasureWebpackPlugin();
const { BundleAnalyzerPlugin } = WebpackBundleAnalyzer;
const { ANALYZE } = process.env;

const webpackConfig = {
  entry: {
    // 'osp-design': './src/oss_core/edesign/osp/design/index.js',
    'new-osp-design': './src/oss_core/edesign/osp/osp.js',
    project: './src/oss_core/edesign/project/projectHome.js',
    plan: './src/oss_core/plan/plan.js',
    // 'manager-map': './src/oss_core/edesign/ui-itf/manager-map/views/managerMap.js',
    // 'designer-map': './src/oss_core/edesign/ui-itf/designer-map/views/designerMap.js',
    // dashboard: './src/oss_core/edesign/ui-itf/dashboard/main.js',
  },
  output: {
    filename: '[name].js',
    library: '[name].js',
    path: path.resolve(__dirname, '../dist/oss_core/edesign/view'),
    publicPath: '/oss_core/edesign/view',
    libraryTarget: 'umd',
  },
  // devtool: 'inline-source-map',
  mode: 'production',
  module: {
    // rules: utils.styleLoaders({
    //   sourceMap: false,
    //   extract: true,
    //   usePostCSS: true,
    // }),
    rules: [
      {
        test: /\.(scss|css)$/,
        use: ExtractTextPlugin.extract({
          use: [
            { loader: 'css-loader' },
            { loader: 'postcss-loader' },
            { loader: 'sass-loader' },
            {
              loader: 'sass-resources-loader',
              options: {
                resources: path.resolve(__dirname, '../src/oss_core/base/css/_variable.scss'),
              },
            },
          ],
          publicPath: '../../',
          fallback: 'vue-style-loader',
        }),
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/oss_core/base/assets/'),
        to: path.resolve(__dirname, '../dist/oss_core/edesign/assets/'),
      },
      {
        from: path.resolve(__dirname, '../src/oss_core/base/appConfig/'),
        to: path.resolve(__dirname, '../dist/oss_core/edesign/appConfig/'),
      },
      {
        from: path.resolve(__dirname, '../src/portal_menu/edesign/'),
        to: path.resolve(__dirname, '../dist/oss_core/edesign/'),
      },
      {
        from: path.resolve(__dirname, '../lib/'),
        to: path.resolve(__dirname, '../dist/oss_core/edesign/lib/'),
      },
    ]),
    // new webpack.optimize.SplitChunksPlugin({
    //   chunks: 'async',
    //   minSize: 30000,
    //   minChunks: 1,
    //   maxAsyncRequests: 5,
    //   maxInitialRequests: 3,
    //   automaticNameDelimiter: '~',
    //   name: true,
    //   cacheGroups: {
    //     vendors: {
    //       test: /[\\/]node_modules[\\/]/,
    //       priority: -10,
    //     },
    //     default: {
    //       minChunks: 2,
    //       priority: -20,
    //       reuseExistingChunk: true,
    //     },
    //   },
    // }),
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true,
    }),
  ],
};
if (ANALYZE === 'true') {
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}
module.exports = smp.wrap(merge(baseWebpackConfig, webpackConfig));
