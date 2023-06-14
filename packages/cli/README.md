# APP-META 终端命令行工具
> 借助`终端工具`便捷使用平台功能

# 概述

## 功能清单

```shell
Commands:
  query|q <keyword>      检索应用或者页面
  page [id]              功能页面相关
                         查看详情：meta page {id}
  data|d                 应用数据的CURD
  dbm                    数据源管理模块
  api [options] [id]     调用开放接口
  info                   显示相关信息并检测本地与服务器的联通性（返回服务器时间）
  config <name> [value]  设置或获取配置项
  whoami [id]            获取或者设置用户ID
  system|sys             管理员/平台级别功能
```

# 使用说明

## 开发环境
> 请先安装跟项目的依赖

进入 `cli` 目录，指定 `node . -h` 查看命令说明，示例：`node . info`

## 打包 / 安装

* `pnpm build` 使用 webpack 进行打包
* `pnpm offline` 将打包后的文件及`package.json`压缩为离线包
* 在其他机器上解压上一步包，执行`npm link`即可完成全局安装，届时可以通过`meta -h`使用 😀

## 二次开发

# 附录

## 参考文档

* [前端亮点 or 提效？开发一款 Node CLI 终端工具！](https://juejin.cn/post/7178666619135066170)
