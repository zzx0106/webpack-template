import './base.scss';
import './reset.scss';
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import App from './app';

console.log('runtime env', process.env.NODE_ENV);

const container = document.getElementById('root');
const root = createRoot(container!);
// 不能将App的jsx写在当前目录，因为
// https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/177#issuecomment-718271457
// 译：当您编辑非常接近根目录（即 ReactDOM.render）的代码路径时，避免不必要的救助的最佳方法是在您执行 ReactDOM 的文件中根本没有任何 JSX。
root.render(<App />);
// ReactDOM.render(<App />, container);
