const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./build/webpack.base.conf.js');

const options = {
  contentBase: './src',
  hot: true,
  host: 'localhost',
  proxy: {
    '/oss/edesign/': 'http://172.16.24.105:8585/',
  },
};

WebpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new WebpackDevServer(compiler, options);

server.listen(5000, 'localhost', () => {
  // console.log('dev server listening on port 5000');
});
