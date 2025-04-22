# APP-META 客户端平台
> 基于 [Electron](https://www.electronjs.org/) 的客户端封装

## 开发

### 执行单个脚本
> 机器人脚本文件（js 格式）必须存在

```bash
# 执行某个脚本
npx electron . --script={任务路径}

# e.g.:
npx electron src/index.js --script=../robot/oschina.js

# 生产模式运行单个脚本
npx electron . --script=../demo-robot/OSCHINA.js

# 对于输出乱码的终端（如 powershell）
chcp 65001 && npx ...
```

### 关于打包

由于使用 `monorepo`（一个仓库内包含多个开发项目、模块、包），需要进行特殊设置

1、设置 `.npmrc`

```shell
# 以下配置三选一
# node-linker=hoisted
# shamefully-hoist=true
# public-hoist-pattern=*
shamefully-hoist=true
```

2、`client`包下 package.json 的 electron 版本需要设置为具体的值（即不带`^~`等），否则会报以下错误：

```text
Cannot compute electron version from installed node modules - none of the possible electron modules are installed.
```

**打包时碰到的问题**

* 找不到 app-builder-bin

```log
The system cannot find the path specified.
spawn E:\workspace\nerve\app-meta\node_modules\app-builder-bin\win\x64\app-builder.exe ENOENT
```

去 node_modules 目录下检查，发现确实不存在`app-builder-bin`（如果通过 yarn 该目录是存在的）。

重新安装依赖（先删除 node_modules 目录）却发现是存在该目录的，但是执行打包后被删除了（可恶😠...）

最后使用`shamefully-hoist=true`的配置可以解决该问题

* ERROR: Cannot create symbolic link :lib\libcrypto.dylib

以`管理员`运行 cmd，再执行构建命令

## 附录

### 开发时工具

* [nodemon](https://github.com/remy/nodemon) 监听文件变动，自动重启 Electon 进程

### 参考

* [electron-quick-start-typescript](https://github.com/electron/electron-quick-start-typescript)
* [从零搭建Electron开发环境（无Vue无React）](https://zhuanlan.zhihu.com/p/601918587)

### electron 版本升级

* 2025-04-22 升级到`35.2.0`
    * 依赖增加：@discoveryjs/json-ext、@types\dompurify、dompurify
