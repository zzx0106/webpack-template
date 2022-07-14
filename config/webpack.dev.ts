// 合并配置项
import { merge } from 'webpack-merge';
// 引入base相关配置
import baseConfig from './webpack.config.base';

import path from 'path';
import type { Configuration } from 'webpack';
// 如果使用到了devserver，需要这样配置才能不报类型错
// import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
// in case you run into any typescript error when configuring `devServer`
import 'webpack-dev-server';

const devConfig: Configuration = merge(baseConfig, {
  mode: 'development',
  // dev环境下性价比最高的source-map :https://webpack.docschina.org/configuration/devtool/#root
  devtool: 'cheap-module-source-map',
  stats: {
    // 增加资源信息
    assets: false,
    // 去除version相关信息
    version: false,
    // 去除compilation的hash
    hash: false,
    // 增加包 和 包合并 的来源信息
    chunkOrigins: false,
    // 增加内置的模块信息
    modules: false,
    // 增加时间信息
    timings: false,
    // 增加错误的详细信息（就像解析日志一样）
    errorDetails: false,
    // `webpack --colors` 等同于，让输出带上颜色
    colors: true,
  },
  // 输出目录
  output: {
    // 可以配置cdn地址，这里和dev环境可以一样，也可以不一样，根据当前服务器来
    publicPath: '/',
    filename: 'static/js/bundle.js',
    path: undefined, // dev不输出物理文件，这样很多插件就不会运行，加快打包速率
  },
  devServer: {
    port: 'auto' || 10073, // 端口，cra通过detect-port-alt插件来判断端口是否被占用
    host: '0.0.0.0',
    historyApiFallback: true, // 前端路由配置为 history 模式时用
    open: false, // 自动打开浏览器
    compress: true, // 启动 gzip 压缩
    hot: true, // 热更新
    static: {
      // 告诉服务器从哪里提供内容。只有在你希望提供静态文件时才需要这样做
      directory: path.resolve(__dirname, '../public'),
    },
    client: {
      logging: 'none', // 去除hrm日志
      overlay: true, // 当出现编译器错误或警告时，在浏览器中显示全屏覆盖层
      progress: true, // 构建进度
    },
    // 设置代理，解决跨域访问 —— 如果有需要的话
    // proxy: {
    // // 将本地 /api/xxx 代理到 localhost:3000/api/xxx
    // '/api': 'http://localhost:3000',
    // // 将本地 /api2/xxx 代理到 localhost:3000/xxx
    // '/api2': {
    //   target: 'http://localhost:3000',
    //   pathRewrite: {
    //     '/api2': '',
    //   },
    // },
    // },
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        // use的顺序，是从 右 -> 左
        use: [
          // 如果是开发环境下，只需要用到style-loader
          // 解析css语法并注入js
          'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              // 使用dart-sass
              implementation: require('sass'),
            },
          },
        ],
      },
    ],
  },
  optimization: {
    moduleIds: 'named', // 当开启 HMR 的时候使用该插件会显示模块的相对路径，建议用于开发环境。
  },
});

export default devConfig;
