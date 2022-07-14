// const postcssImport = require('postcss-import');
// const postcssUrl = require('postcss-url');
const postcssPresetEnv = require('postcss-preset-env');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
// const cssnano = require('cssnano');

module.exports = {
  plugins: [
    // postcssImport({}),
    // postcssUrl({}),
    postcssPresetEnv(),
    postcssFlexbugsFixes(),
    // cssnano({
    //   cssnano: {
    //     preset: 'advanced',
    //     autoprefixer: false, // 和cssnext同样具有autoprefixer，保留一个
    //     'postcss-zindex': false,
    //   },
    // }),
  ],
};
