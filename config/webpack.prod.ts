// 引入base相关配置
import baseConfig from './webpack.config.base';
// 合并配置项
import { merge } from 'webpack-merge';

import path from 'path';
import type { Configuration } from 'webpack';
import glob from 'glob';
import TerserPlugin from 'terser-webpack-plugin';
import WebpackBundleAnalyzerPlugin from 'webpack-bundle-analyzer';

const BundleAnalyzerPlugin = WebpackBundleAnalyzerPlugin.BundleAnalyzerPlugin;

// 抽离css，不适用改插件时，css代码会被打包到js中，然后通过注入的方式，注入到html中
// 抽离后，会生成css文件
// 新版本webpack不使用该插件，这里做了解
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
// webpack5版本使用mini-css-extract-plugin进行css抽离
// 与 extract-text-webpack-plugin 相比：
// 异步加载
// 没有重复的编译（性能）
// 更容易使用
// 特别针对 CSS 开发
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// 底层使用cssnano压缩css文件
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
// const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const PATHS = {
  src: path.join(__dirname, 'src'),
};
// TODO 这里可以通过相关配置开启source-map，例如，我们如果要使用sentry上传source-map，可以开启source-map后，
// 先将map文件上传，然后再删除掉css和js目录下的所有**.map文件
const openSourceMap = true;
// 合并配置
const prodConfig: Configuration = merge(baseConfig, {
  // 使用正式环境的mode
  mode: 'production',
  devtool: openSourceMap ? 'source-map' : false, // TODO source-map不对外，如果要上传，需要保存后删除map文件，避免源码外泄
  // 关于hash，contenthash，chunkhash之间的区别：https://juejin.cn/post/6844903542893854734
  // 区别简述:
  // hash: 每次打包都会生成新的hash
  // contenthash：当内容修改时hash才会变化，多用于src内的内容
  // chunkhash：入口引用变化时才会变化，所以多用于插件
  output: {
    // 可以配置cdn地址，这里和dev环境可以一样，也可以不一样，根据当前服务器来
    publicPath: '/',
    // 生成的文件名 文件名-8位长度的hash.js
    filename: 'js/[name].[contenthash:6].js',
    // 除了entry定义的js之外的js打包成这个，不设置这个的话打包出来就是0.bundle.js ...，
    chunkFilename: 'js/[name].[chunkhash:6].js',
    path: path.resolve(__dirname, '../build'),
  },
  module: {
    rules: [
      // 优化一下source-map cra内的做法
      openSourceMap && {
        enforce: 'pre',
        exclude: /@babel(?:\/|\\{1,2})runtime/,
        test: /\.(js|mjs|jsx|ts|tsx|css)$/,
        loader: require.resolve('source-map-loader'),
      },
      {
        test: /\.(sa|sc|c)ss$/,
        // use的顺序，是从 右 -> 左
        use: [
          // style-loader   // 解析css语法并注入js
          // 如果是开发环境下，只需要用到style-loader
          MiniCssExtractPlugin.loader,
          'css-loader', // 解析css的import或者什么
          {
            loader: 'postcss-loader',
            options: {
              // sourceMap: openSourceMap,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              // 使用dart-sass
              implementation: require('sass'),
            },
          },
        ],
        // 旧版本
        // use: ExtractTextPlugin.extract({
        //   fallback: 'style-loader',
        //   use: ['css-loader'],
        //   publicPath: '/dist',
        // }),
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial',
          minChunks: 2,
        },
      },
    },
    runtimeChunk: 'single',
    minimizer: [
      new TerserPlugin({
        // 下面对应的是terserMinify的压缩配置
        // minify: TerserPlugin.terserMinify, // 使用terser编译
        // terserOptions: {
        //   parse: {
        //     // We want terser to parse ecma 8 code. However, we don't want it
        //     // to apply any minification steps that turns valid ecma 5 code
        //     // into invalid ecma 5 code. This is why the 'compress' and 'output'
        //     // sections only apply transformations that are ecma 5 safe
        //     // https://github.com/facebook/create-react-app/pull/4234
        //     ecma: 8,
        //   },
        //   compress: {
        //     ecma: 5,
        //     warnings: false,
        //     // Disabled because of an issue with Uglify breaking seemingly valid code:
        //     // https://github.com/facebook/create-react-app/issues/2376
        //     // Pending further investigation:
        //     // https://github.com/mishoo/UglifyJS2/issues/2011
        //     comparisons: false,
        //     // Disabled because of an issue with Terser breaking valid code:
        //     // https://github.com/facebook/create-react-app/issues/5250
        //     // Pending further investigation:
        //     // https://github.com/terser-js/terser/issues/120
        //     inline: 2,
        //   },
        //   mangle: {
        //     safari10: true,
        //   },
        //   output: {
        //     ecma: 5,
        //     comments: false,
        //     // Turned on because emoji and regex is not minified properly using default
        //     // https://github.com/facebook/create-react-app/issues/2488
        //     ascii_only: true,
        //   },
        // },
        // parallel: true, // 多线程启动，默认启动
        // 目前测试 2.54s -> 0.85s
        minify: TerserPlugin.esbuildMinify, // 使用esbuild编译，加快速度
        // esbuild的配置
        // terserOptions: {
        // esbuild的配置受外部.browserlistrc文件的影响，但是配置有个阈值，因为esbuild不支持太低的浏览器版本
        // 如果要兼容ie等版本，需要使用terser
        // ios >= 11
        // chrome >= 49
        // edge >= 14
        // not ie
        // firefox >= 51
        // safari >= 11
        // target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
        // },
      }),
      // css压缩使用cssnano
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    // css抽离
    new MiniCssExtractPlugin({
      // For projects where css ordering has been mitigated through consistent use of scoping or naming conventions,
      // the css order warnings can be disabled by setting the ignoreOrder flag to true for the plugin.
      ignoreOrder: true,
      filename: 'css/[name].[contenthash:6].css', // 设置文件名 xxx.xxxxxx.css
      chunkFilename: 'css/[id].[contenthash:6].css',
    }),
    // css tree shaking ， 使用时需要针对对应插件以及global.css等做配置，因为如果没有使用到，会默认摇掉
    // new PurgeCSSPlugin({
    // 这个配置就类似于js tree shaking的sideEffects了
    //   paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true })
    // }),
    // 开启打包chunk分析
    // new BundleAnalyzerPlugin(),
  ],
});
export default prodConfig;
