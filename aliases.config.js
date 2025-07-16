/* Used by webpack, babel and eslint */

const path = require('path');

module.exports = {
  '@codinsky/parse-js': path.resolve(__dirname, 'packages/parse/src'),
  '@codinsky/curate': path.resolve(__dirname, 'packages/curate/src'),
  'my-mode': path.resolve(__dirname, 'addFolder/my-mode/src'),
  '@ohif/extension-my-mode': path.resolve(__dirname, 'addFolder/extensions/my-mode/src'),
  '@components': path.resolve(__dirname, 'platform/app/src/components'),
  '@hooks': path.resolve(__dirname, 'platform/app/src/hooks'),
  '@routes': path.resolve(__dirname, 'platform/app/src/routes'),
  '@state': path.resolve(__dirname, 'platform/app/src/state'),
};
