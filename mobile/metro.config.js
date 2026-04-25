/**
 * Zenvora AI Platform - Metro Configuration
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    alias: {
      '@components': './src/components',
      '@screens': './src/screens',
      '@utils': './src/utils',
      '@assets': './src/assets',
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
