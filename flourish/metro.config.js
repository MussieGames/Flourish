const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required for Firebase JS SDK compatibility with Metro's package.json exports
// See: https://github.com/expo/expo/issues/36588
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
