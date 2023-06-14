<div align=center>
<h1>🎉 应用元宇宙 / APP META 🎉</h1>

![Language](https://img.shields.io/github/languages/top/0604hx/app-meta?logo=javascript&color=blue)
![License](https://img.shields.io/badge/License-MIT-green)
![LastCommit](https://img.shields.io/github/last-commit/0604hx/app-meta?color=blue&logo=github)

</div>

```text
 _______  _______  _______    __   __  _______  _______  _______ 
|   _   ||       ||       |  |  |_|  ||       ||       ||   _   |
|  |_|  ||    _  ||    _  |  |       ||    ___||_     _||  |_|  |
|       ||   |_| ||   |_| |  |       ||   |___   |   |  |       |
|       ||    ___||    ___|  |       ||    ___|  |   |  |       |
|   _   ||   |    |   |      | ||_|| ||   |___   |   |  |   _   |
|__| |__||___|    |___|      |_|   |_||_______|  |___|  |__| |__|
```

> 基于 [SpringBoot3](https://spring.io/projects/spring-boot) + [VUE3](https://cn.vuejs.org/) + [Naive UI](https://www.naiveui.com) + [Electron](https://www.electronjs.org) 应用快速开发、发布平台，旨在帮助使用者（包含但不限于开发人员、业务人员）快速响应业务需求，此仓库为前端，后端仓库详见[app-meta-server](https://github.com/0604hx/app-meta-server)。

![](docs/imgs/平台概述.jpg)

可前往[screenshot](docs/screenshots)查看平台运行时截图。

## 开发说明
> 这是一个基于 [pnpm](https://pnpm.io/) 的 monorepo 项目，构建工具为 [webpack5](https://webpack.js.org/)

### 包说明
> 项目包存放于`packages`下

包名|说明
-|-
basic|基础函数、常量
cli|以命令行方式与后端进行交互
client|基于`electron`的客户端封装
library|工具库，为`ui`包、`小程序`等提供常用功能的一致性调用
server|开发阶段用于模拟 `CAS` 登录，基于 [fastify](https://www.fastify.io/)
ui|平台前端

### 启动命令

命令|说明
-|-
serve|启动`ui`项目（基于 webpack5、Vue3）
build|构建`ui`项目（用于部署上线）
client:start|启动`client`项目（基于 Electron）
client:watch|以热重载方式启动`client`（文件变动可自动重启进程）

### 依赖
> `.npmrc` 文件指定了 electron 下载镜像

## 附录

### 常见问题

#### electron 运行时控制台乱码

在控制台中执行`chcp 65001`，或者使用 `vite` 的 `createLogger` 组件 

详见：[PowerShell 中文乱码](https://www.cnblogs.com/lobtao/articles/14421673.html)

### 补充说明

1. 仅为个人学习项目
