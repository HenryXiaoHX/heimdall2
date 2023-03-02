const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

// Lookup constants
const fs = require('fs');

// This grabs the js/css to allow for HTML export
const files = {
  [require.resolve('bootstrap/dist/css/bootstrap.min.css')]:
    'public/static/export/bootstrap.min.css',
  [require.resolve('bootstrap/dist/js/bootstrap.min.js')]:
    'public/static/export/bootstrap.min.js',
  [require.resolve('jquery/dist/jquery.min.js')]:
    'public/static/export/jquery.min.js'
};

for (const file in files) {
  fs.copyFile(file, files[file], (err) => {
    if (err) {
      throw err;
    }
  });
}

module.exports = {
  lintOnSave: 'warning',
  publicPath: '/',
  devServer: {
    // JWT_SECRET is a required secret for the backend. If it is sourced
    // then it is safe to assume the app is in server mode in development.
    // PORT is not required so use the default backend port value
    // is used here if JWT_SECRET is applied but PORT is undefined
    proxy: process.env.JWT_SECRET
      ? `http://127.0.0.1:${process.env.PORT || 3000}`
      : ''
  },
  outputDir: '../../dist/frontend',
  configureWebpack: {
    resolve: {
      fallback: {
        fs: false
      }
    },
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/,
          enforce: 'post',
          use: [{loader: path.resolve('./stripStrictLoader.js')}]
        },
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', {modules: 'commonjs'}],
              plugins: [
                [
                  '@babel/plugin-transform-modules-commonjs',
                  {
                    loose: true,
                    strictMode: false
                  }
                ]
              ]
            }
          }
        }
      ]
    },
    devtool: 'source-map',
    plugins: [
      new NodePolyfillPlugin({
        includeAliases: [
          'crypto',
          'path',
          'http',
          'https',
          'os',
          'zlib',
          'process',
          'Buffer',
          'stream'
        ]
      })
    ]
  },
  chainWebpack: (config) => {
    // Disable resolve symlinks to silence eslint when using `npm link`
    // (when developing inspecjs locally): https://stackoverflow.com/a/57518476/1670307
    config.resolve.symlinks(false);
    config.module
      .rule('vue')
      .use('vue-svg-inline-loader')
      .loader('vue-svg-inline-loader')
      .options();
  }
};
