const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// This example loads the library straight from ../src, so edits to the library
// show up live. In your own app you just `npm i react-native-toastify-lite`
// and keep the default Metro config.
const root = path.resolve(__dirname, '..');
const escape = p => p.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&');

const config = {
  watchFolders: [root],
  resolver: {
    extraNodeModules: {
      'react-native-toastify-lite': path.join(root, 'src'),
    },
    nodeModulesPaths: [path.join(__dirname, 'node_modules')],
    // never pick up the library's own dev copies of react / react-native
    blockList: [new RegExp(`^${escape(path.join(root, 'node_modules'))}[/\\\\].*`)],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
