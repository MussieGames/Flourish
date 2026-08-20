// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK (>=12) ships separate React Native entry points that Metro's
// newer `package.json#exports` resolution does not pick up correctly, which
// surfaces at runtime as "Component auth has not been registered yet".
// Disabling strict package exports + allowing `.cjs` resolves Firebase to its
// React Native build (where getReactNativePersistence lives).
// See https://docs.expo.dev/guides/using-firebase/#configure-metro
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
