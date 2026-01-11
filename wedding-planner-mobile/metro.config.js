const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Używamy path.resolve, aby ścieżka była bezbłędna na Windows
module.exports = withNativeWind(config, { input: path.resolve(__dirname, "global.css") });