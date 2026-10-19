module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Reanimated 4: the worklets plugin must be listed last.
  plugins: ['react-native-worklets/plugin'],
};
