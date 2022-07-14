import path from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
// react新的热更新方案
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import chalk from 'chalk';
// 增加编译进度条
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
// 清除build，
// 也可以使用 rimraf 插件，通过修改package.json的script
// "scripts": {
//   +  "build": "rimraf ./build && webpack --config ./webpack.config.js"
//   -  "build": "webpack --config ./webpack.config.js"
// }
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import './env';

console.log('process.env.NODE_ENV', process.env.APP_MODE, process.env.NODE_ENV);
// 命令执行环境
const devMode = process.env.NODE_ENV !== 'production';

const baseConfig: Configuration = {
  // 定义入口文件，告诉webpack我要打包啥
  entry: path.resolve(__dirname, '../src/index'),
  // 定义输出文件，告诉webpack打包好的文件叫啥，给我放到哪里
  resolve: {
    alias: {
      // 识别@标识
      '@': path.resolve(__dirname, '../src'),
    },
    // 让编辑器识别改后缀的文件，即可以省略掉对应文件后缀
    extensions: ['.tsx', '.ts', '.js', 'json', 'jsx'],
  },
  cache: {
    type: 'filesystem', // 使用文件缓存，该方案优于dll
    // cacheDirectory: path.resolve(__dirname, '.temp_cache'), // 不配置地址，默认在node_modules/.cache/webpack 里面
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  module: {
    rules: [
      // { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        // 指定范围后，速度加快
        include: path.resolve(__dirname, '../src'),
        // exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: {
          // 通过对应解析器来解析例如jsx，ts等等相关语法
          presets: [
            ['@babel/preset-env'], //
            ['@babel/preset-typescript'],
            ['@babel/preset-react', { runtime: 'automatic' }],
          ],
          plugins: [
            // fast-fresh，react使用这个替代了react-hot-replace来进行热更新，仅作用域测试环境
            // a.filter(Boolean);
            // 它等价于
            // a.filter(function (x) { return Boolean(x); });
            devMode && require.resolve('react-refresh/babel'), //
          ].filter(Boolean),
          // directory for faster rebuilds.
          cacheDirectory: true,
          // zip
          cacheCompression: false,
          compact: !devMode,
        },
      },
      // webpack5内置了资源模块（asset module），代替了file-loader和url-loader
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/i,
        // raw-loader 将文件导入为字符串
        // url-loader 将文件作为 data URI 内联到 bundle 中
        // file-loader 将文件发送到输出目录

        // 资源模块类型(asset module type)，通过添加 4 种新的模块类型，来替换所有这些 loader：
        // 1. asset/resource 发送一个单独的文件并导出 URL。之前通过使用 file-loader 实现。
        // 2. asset/inline 导出一个资源的 data URI。之前通过使用 url-loader 实现。注： url-loader里面集成了file-loader
        // 3. asset/source 导出资源的源代码。之前通过使用 raw-loader 实现。
        // 4. asset 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 url-loader，并且配置资源体积限制实现。
        // 注：url-loader 当图片小于一定大小时，会变成base64，从而减少http请求数
        type: 'asset',
        generator: {
          filename: 'assets/[name].[hash:7][ext]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, //超过10kb不转base64
          },
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'media/[name].[hash:7].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/source',
        generator: {
          filename: 'fonts/[name].[hash:7].[ext]',
        },
      },
    ],
  },
  plugins: [
    // 每次打包会先删除掉build
    new CleanWebpackPlugin(),
    // 会输出一个index.html到output.path中去，然后该html通过script的方式引入你的bundle文件
    new HtmlWebpackPlugin({
      // 如果我们想使用自己的html模板。
      template: path.resolve(__dirname, '../public/index.html'),
    }),

    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // ice里面也有相应处理，moment文件的local 语言包比较大，需要优化掉
    // new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),
    // 将public文件夹内容转移到build文件夹中去，create-react-app通过fs实现
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'),
          to: path.resolve(__dirname, '../build'),
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/*index.html'], // 过滤掉html
          },
        },
      ],
    }),
    new ProgressBarPlugin({
      total: 100,
      format: `:msg [:bar] ${chalk.green.bold(':percent')} (:elapsed s)`,
    }),
    devMode && new ReactRefreshWebpackPlugin({ overlay: false }),
  ].filter(Boolean) as any,
};
export default baseConfig;
