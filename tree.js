#!/usr/bin/env node
/**
# 树状列表生成器
node tree.js -h // 查看所有的指令

## 下面是指令：
.option('-d, --directory [dir]', '指定文件夹，不填就是当前文件夹', process.cwd())
.option('-i, --ignore [ig]', '使用"a|b|c|d"来过滤文件')
.option('-r, --regexp [rg]', '使用"正则"来过滤文件')
.option('-e, --export [epath]', '输出路径')
.option('-f, --only-folder', '是否只输出文件夹名称')

比如我想排除掉 node_modules 等文件夹

node tree.js -i "node_modules|.idea|.git|dist|t|medias|images" -e tree.md

注：-i 后面接需要排除的文件夹，打印出来会有文件夹名，但不会有内部文件名
-e 为输出路径，其实还可以不用-e
例如

node tree.js -i "node_modules|.idea|.git|dist|t|medias|images" >> tree.md


使用>> 一样能输出，>>输出的是 console 打印的内容。vue-cli 打印 config 也是用的>>

## 正则细化：

建议正则只对文件进行操作，比如我想在上面的基础上再过滤掉所有的.md 和.json 文件

node tree.js -i "node_modules|.idea|.git|dist|t|medias|images" -r ".md|.json" -e tree.md

*/
const program = require('commander');
const version = '0.0.1';
const fs = require('fs');
const path = require('path');

program
  .version(version)
  .option('-d, --directory [dir]', '指定文件夹，不填就是当前文件夹', process.cwd())
  .option('-i, --ignore [ig]', '使用"a|b|c|d"来过滤文件')
  .option('-r, --regexp [rg]', '使用"正则"来过滤文件')
  .option('-e, --export [epath]', '输出路径')
  .option('-f, --only-folder', '是否只输出文件夹名称')
  .parse(process.argv);
const level1 = 1; // 顶层距离最左侧的宽度
const level2 = 3; // 分层的宽度
let ignores = (program.ignore || []).split('|');
let regexp = program.regexp;
let openIgnoreFilter = false;
let openRegExpFilter = false;
if (ignores.length > 0) openIgnoreFilter = true;
if (regexp) openRegExpFilter = true;
const isDir = (path) => fs.lstatSync(path).isDirectory();
const dirList = (path, filter = false) => {
  let ans = {};
  if (filter) return path.replace(/.*\/(?!$)/g, '');
  if (isDir(path)) {
    let dirs = fs.readdirSync(path, { withFileTypes: true }).sort((a, b) => {
      return b.isDirectory() - a.isDirectory() || (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1);
    });
    if (program.onlyFolder) dirs = dirs.filter((child) => isDir(path + '/' + child.name));
    dirs = dirs.reduce((t, child) => {
      let nameFilter = openIgnoreFilter && ignores.indexOf(child.name) > -1;
      let regexpFilter = openRegExpFilter && new RegExp(program.regexp).test(child.name);
      if (regexpFilter) return t;
      t.push(dirList(path + '/' + child.name, nameFilter));
      return t;
    }, []);
    let dirName = path.replace(/.*\/(?!$)/g, '');
    ans[dirName] = dirs;
  } else {
    return path.replace(/.*\/(?!$)/g, '');
  }
  return ans;
};
const result = dirList(program.directory);
const characters = { border: '|', contain: '├', line: '─', last: '└' };
let outputString = '';
const drawDirTree = (data, placeholder) => {
  let { border, contain, line, last } = characters;
  for (let i in data) {
    if (typeof data[i] === 'string') {
      outputString += '\n' + placeholder + data[i];
    } else if (Array.isArray(data[i])) {
      outputString += '\n' + placeholder + i;
      placeholder = placeholder.replace(new RegExp(`${contain}`, 'g'), border);
      placeholder = placeholder.replace(new RegExp(`${line}`, 'g'), Array(level2).join(' '));
      placeholder = placeholder + contain + line;
      placeholder = placeholder.replace(new RegExp('^ +', 'g'), Array(level1).join(' '));
      data[i].forEach((val, idx, arr) => {
        let pl = placeholder;
        if (idx === arr.length - 1) {
          let regex = new RegExp(`${contain}${line}$`, 'g');
          pl = placeholder.replace(regex, last + line);
        }
        if (typeof val === 'string') {
          outputString += '\n' + pl + val;
        } else {
          let pl = placeholder;
          drawDirTree(val, pl);
        }
      });
    }
  }
};

drawDirTree(result, '');
outputString = outputString.replace(/^\n/, '');
console.log(outputString);
if (program.export) {
  const savePath = path.resolve(__dirname, program.export);
  fs.writeFile(savePath, outputString, (err) => {
    if (err) throw err;
    console.log('\n\n' + '以保存至文件:' + savePath);
  });
}
