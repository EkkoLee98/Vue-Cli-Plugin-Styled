/* eslint-disable */

const { defineConfig } = require('windicss/helpers');
const createPreset = require('@lizhengen/sfhk-styled/preset');
const LineClampPlugin = require('windicss/plugin/line-clamp');
const SafeAreaPlugin = require('@lizhengen/sfhk-styled/plugins/SafeAreaPlugin');

module.exports = defineConfig({
  presets: [
    createPreset({ unit: 'rpx' }),
  ],
  plugins: [
    LineClampPlugin,
    SafeAreaPlugin,
  ],
});
