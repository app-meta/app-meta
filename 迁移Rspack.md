# 迁移到 Rspack

## 疑问

1. 请问如何配置 chunk 文件的存放目录
> 类似 vue-cli 的 assetsDir 配置项，如配置值位 `abc`， 达到的效果是将 js、css、img 等放置在 `dist/abc` 目录下

```text
chunkFilename 可以控制异步chunk位置，filename可以控制初始chunk位置

png 等文件可以通过https://webpack.js.org/configuration/module/#rulegeneratorfilename配置
```
