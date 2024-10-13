/* eslint-disable */

const { defineConfig } = require('windicss/helpers');
const createPreset = require('@lizhengen/sfhk-styled/preset');
const LineClampPlugin = require('windicss/plugin/line-clamp');

module.exports = defineConfig({
  presets: [
    createPreset(),
  ],
  preflight: false,
  extract: {
    include: [
      './public/**/*.html',
      './src/**/*.{vue,html,tsx,jsx,ts,js,wxs,sjs}',
    ],
  },
  plugins: [
    LineClampPlugin,
  ],
});
