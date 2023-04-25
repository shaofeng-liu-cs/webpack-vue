const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');
// const utils = require('./style-util');
const { environmentConfig } = require('./environmentConfig');

module.exports = merge(baseWebpackConfig, {
  entry: {
    // 'osp-design': './src/oss_core/edesign/osp/design/index.js',
    'new-osp-design': './src/oss_core/edesign/osp/osp.js',
    project: './src/oss_core/edesign/project/projectHome.js',
    plan: './src/oss_core/plan/plan.js',
    // 'manager-map': './src/oss_core/edesign/ui-itf/manager-map/views/managerMap.js',
    // 'designer-map': './src/oss_core/edesign/ui-itf/designer-map/views/designerMap.js',
    // dashboard: './src/oss_core/edesign/ui-itf/dashboard/main.js',
    // 'web-gis-sdk': './src/oss_core/webgis/sdk/map/gis-lib.js',
    // webgis: './src/oss_core/webgis/main/webgis-main.js',
    // 'res-locate': './src/oss_core/webgis/res-locate/ResLocate.js',
    // 'fault-locate': './src/oss_core/webgis/fault-locate/FaultLocate.js',
    // 'wireless-sector': './src/oss_core/webgis/wireless-sector/WirelessSector.js',
    // 'splitter-trace': './src/oss_core/webgis/splitter-trace/SplitterTrace.js',
  },
  output: {
    filename: '[name].js',
    library: '[name].js',
    libraryTarget: 'umd',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true, // 使用多进程并发运行以提高构建速度。 并发运行的默认数量： os.cpus().length - 1
        cache: true, // 启用文件缓存。缓存目录的默认路径：node_modules/.cache/terser-webpack-plugin。
      }),
    ],
  },
  devtool: 'cheap-module-eval-source-map', // inline-source-map
  devServer: {
    contentBase: './dist',
    open: true,
    hot: true,
    host: 'localhost',
    // 配置多个url的代理
    proxy: [
      {
        context: [
          '/iserver',
          '/edesign', // edn后台接口转发
          '/im', // im后台接口
          '/oss/styles',
          '/opb',
          '/oss_public',
          '/frm',
          '/login',
          '/logged',
          '/styles',
          '/gis-plat/open-api',
          '/oss_core/im/rivt/gis',
          '/oss_core/im',
          // '/oss_core/edesign',
          '/oss_core/edesign/assets', // 静态文件更新后需要更新到线上要不会获取不到最新的今天文件
          '/oss_core/edesign/lib', // 静态文件更新后需要更新到线上要不会获取不到最新的今天文件
          '/users',
        ],
        target: `${environmentConfig.online_design}/oss`,
        changeOrigin: true, // target是域名的话，需要这个参数，
        secure: false, // 设置支持https协议的代理
        pathRewrite: { '^/oss/styles': '/styles' },
      },
      {
        context: ['/oss_core/edesign/view'], // 路径通过转发和生产保持一致
        target: 'http://localhost:8080/', // 当前服务地址
        changeOrigin: true, // target是域名的话，需要这个参数，
        secure: false, // 设置支持https协议的代理
        pathRewrite: { '^/oss_core/edesign/view': '/' },
      },
      {
        context: ['/arcgis'],
        target: `${environmentConfig.arcgis}/`,
        changeOrigin: true, // target是域名的话，需要这个参数，
        secure: false, // 设置支持https协议的代理
      },
      {
        context: ['/geoserver'],
        target: `${environmentConfig.geoserver}/oss`,
        changeOrigin: true,
        secure: false, // 设置支持https协议的代理
      },
      {
        context: ['/gis-plat/gis-sdk/gis'],
        target: `${environmentConfig.gis_platform}/oss`, // http://10.45.48.200:8080/  http://localhost:8080/
        changeOrigin: true,
        secure: false, // 设置支持https协议的代理
        // pathRewrite: { '^/gis-plat/gis-sdk/gis': '/gis' },
      },
    ],
  },
  mode: 'development',
  module: {
    // rules: utils.styleLoaders({
    //   sourceMap: true,
    //   extract: false,
    //   usePostCSS: true,
    // }),
    rules: [
      {
        test: /\.(scss|css)$/,
        // loader: 'happypack/loader?id=sass',
        use: [
          'vue-style-loader',
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'happypack/loader?id=sass' },
          // {
          //   loader: 'sass-loader',
          //   options: { sourceMap: true },
          // },
          // {
          //   loader: 'sass-resources-loader',
          //   options: {
          //     resources: path.resolve(__dirname, '../src/oss_core/base/css/_variable.scss'),
          //   },
          // },
        ],
      },
    ],
  },
  externals: {
    'web-gis-sdk': 'umd web-gis-sdk.js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: false,
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../devconfig/config.js'),
        to: path.resolve(__dirname, '../dist/'),
      },
      {
        from: path.resolve(__dirname, '../src/oss_core/base/appConfig/'),
        to: path.resolve(__dirname, '../dist/oss_core/edesign/appConfig/'),
      },
      {
        from: path.resolve(__dirname, '../src/oss_core/base/assets/css/'),
        to: path.resolve(__dirname, '../dist/oss_core/edesign/assets/css/'),
      },
      // {
      //   from: path.resolve(__dirname, '../library/'),
      //   to: path.resolve(__dirname, '../dist/'),
      // },
      // {
      //   from: path.resolve(__dirname, '../src/oss_core/base/assets/'),
      //   to: path.resolve(__dirname, '../dist/oss_core/edesign/assets/'),
      // },
      // {
      // {
      // from: path.resolve(__dirname, '../lib/'),
      // to: path.resolve(__dirname, '../dist/oss_core/edesign/lib/'),
      // },
      // {
      //   from: path.resolve(__dirname, '../src/portal_menu/edesign/'),
      //   to: path.resolve(__dirname, '../dist/oss_core/edesign/'),
      // },
    ]),
    new webpack.HotModuleReplacementPlugin(),
    new HardSourceWebpackPlugin(),
  ],
});
