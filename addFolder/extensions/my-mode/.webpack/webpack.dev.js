const path = require('path');
const { merge } = require('webpack-merge');
const webpackCommon = require('./../../../.webpack/webpack.base.js');
const SRC_DIR = path.join(__dirname, '../src');
const DIST_DIR = path.join(__dirname, '../dist');

const ENTRY = {
  app: `${SRC_DIR}/index.tsx`,
};

module.exports = (env, argv) => {
  const commonConfig = webpackCommon(env, argv, { SRC_DIR, DIST_DIR, ENTRY });

  return merge(commonConfig, {
    resolve: {
      alias: {
        '@ohif/extension-default': path.resolve(__dirname, '../../../extensions/default/src'),
        '@ohif/extension-my-mode': path.resolve(__dirname, '../src'),
      },
    },
  });
};
