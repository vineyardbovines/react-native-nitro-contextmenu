const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root for changes
config.watchFolders = [monorepoRoot];

// Resolve modules from both the example and the root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force resolution of react-native-nitro-contextmenu to the local package
config.resolver.extraNodeModules = {
  'react-native-nitro-contextmenu': monorepoRoot,
};

// Ensure we don't have duplicate React instances
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
