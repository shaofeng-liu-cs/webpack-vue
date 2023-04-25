/*
 * @Author: your name
 * @Date: 2020-04-09 16:25:55
 * @LastEditTime: 2021-08-25 14:47:37
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design-web\build\webpack.base.conf.js
 */
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const HappyPack = require('happypack'); // 打包速度优化

// 安装 OS 模块 这个主要是拿到当前电脑的CPU核数
const os = require('os');
// 这个是设置共享线程池中的数量 size 控制设置数量 只能是整数
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length - 1 });
// const happyThreadPool = HappyPack.ThreadPool({ size: 6 });

// const projectUrl = process.env.PROJECT === 'libya' ? '../src/libya' : '../src';
const dev = process.env.NODE_ENV && process.env.NODE_ENV === 'development';

module.exports = {
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
      // '@project': path.resolve(__dirname, projectUrl),
    },
  },
  externals: {
    map: 'umd gis-plat/gis-sdk/gis/map.js',
    ht: 'umd oss_core/edesign/lib/ht/index.js',
    vue: 'umd oss_core/edesign/lib/vue/vue.min.js',
    'element-ui': 'umd oss_core/edesign/lib/element-ui/index.js',
    addrPub: 'umd oss_public/opb/widget/area_search_pub/views/AreaSearchPub.js',
    webuploader: 'umd frm/fish-desktop/third-party/webupload/js/webuploader.js',
    'web-gis-sdk': 'umd oss_core/im/rivt/gis/view/web-gis-sdk',
  },
  module: {
    rules: [
      { test: /\.hbs$/, use: ['handlebars-loader'] },
      // {
      //     test: /\.vue$/,
      //     include: path.resolve(__dirname, '../src'),
      //     use: {
      //         loader: 'vue-loader',
      //         options: {
      //             loaders: {
      //                 // you need to specify `i18n` loaders key with `vue-i18n-loader` (https://github.com/kazupon/vue-i18n-loader)
      //                 i18n: '@kazupon/vue-i18n-loader'
      //             }
      //         }
      //     }
      // }
      {
        test: /\.vue$/,
        // loader: 'vue-loader',
        use: [
          {
            loader: 'vue-loader',
            options: {
              loaders: {
                // css: 'happypack/loader?id=css',
                scss: 'happypack/loader?id=sass',
                js: 'happypack/loader?id=happyBabel',
              },
            },
          },
        ],
        include: path.resolve(__dirname, '../src'),
        exclude: /node_modules/,
      },
      // {
      //   test: /\.vue$/,
      //   loader: 'vue-loader',
      //   include: path.resolve(__dirname, '../src'),
      //   exclude: /node_modules/,
      // },
      {
        resourceQuery: /blockType=i18n/,
        type: 'javascript/auto',
        loader: '@kazupon/vue-i18n-loader',
        include: path.resolve(__dirname, '../src'),
        exclude: /node_modules/,
      },
      {
        test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
        loader: 'url-loader',
        include: path.resolve(__dirname, '../src'),
        exclude: /node_modules/,
      },

      // {
      //   test: /\.(jsx?|babel|es6)$/,
      //   loader: 'babel-loader',
      //   exclude: /node_modules/,
      // },
      {
        test: /\.(jsx?|babel|es6)$/,
        loader: 'happypack/loader?id=happyBabel',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({
      // 自动加载模块
      ht: 'ht',
    }),
    new HappyPack({
      // id标识happypack处理那一类文件
      id: 'happyBabel',
      // 配置loader
      loaders: [
        {
          // loader: 'babel-loader?cacheDirectory=true',
          loader: 'babel-loader',
        },
      ],
      // 共享进程池
      threadPool: happyThreadPool,
      // 开启缓存
      // cache: true
    }),
    new HappyPack({
      id: 'sass',
      loaders: [
        // 'vue-style-loader',
        // {
        //   loader: 'css-loader',
        //   options: { sourceMap: dev },
        // },
        // {
        //   loader: 'postcss-loader',
        //   options: { sourceMap: dev },
        // },
        {
          loader: 'sass-loader',
          options: { sourceMap: dev },
        },
        {
          loader: 'sass-resources-loader',
          options: {
            sourceMap: dev,
            resources: path.resolve(__dirname, '../src/oss_core/base/css/_variable.scss'),
          },
        },
      ],
      threadPool: happyThreadPool,
    }),
    // new webpack.DllReferencePlugin({
    //   manifest: require('../library/library.json'),
    // }),
  ],
};
