const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');

const peerDeps = Object.keys(pak.peerDependencies || {});

// Block the root's copies of peer deps so only the example's copies are used,
// preventing duplicate React instances.
const blockPatterns = peerDeps.map(
  dep =>
    new RegExp(
      `^${path.resolve(root, 'node_modules', dep).replace(/[/\\.*+?^${}()|[\]]/g, '\\$&')}/.*$`,
    ),
);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [root],
  resolver: {
    blockList: blockPatterns,
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(root, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
