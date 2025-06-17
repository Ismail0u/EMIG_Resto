const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Appliquer la configuration du transformeur SVG
config.transformer = {
  ...config.transformer, // Conserver les paramètres de transformeur existants
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  ...config.resolver, // Conserver les paramètres de résolution existants
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'), // Retirer 'svg' des extensions d'assets
  sourceExts: [...config.resolver.sourceExts, 'svg'], // Ajouter 'svg' aux extensions de source
};

// Exporter la configuration fusionnée avec NativeWind
module.exports = withNativeWind(config, { input: './global.css' });