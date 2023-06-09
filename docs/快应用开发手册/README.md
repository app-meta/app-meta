# 开发手册
> 针对`快应用`的开发者手册

# 内置接口
> 介绍了平台提供的各类接口，标记`CLIENT`的接口需要本地客户端环境

## 日期工具 / Date
> `window.D`，源文件为 packages/ui/src/util/date.js

方法名|参数|说明|示例
-|-|-|-
date|(d=new Date(), f="YYYY-MM-DD")|获取格式化的日期|2023-01-01
time|(d=new Date())|获取格式化的时间|12:00:00
compact|(d=new Date())|纯日期|20230101
compactTime|(d=new Date())|纯时间|120000
datetime|(d=new Date())|获取格式化的日期+时间|2023-01-01 12:00:00
relative|(t, minSuffix="", timePrefix="于")|相对时间|3 分钟、于 12:00
relativeHistory||
hour||获取当前小时|12
addDay|(step=1, d, key="day")|日期增减|参数 d 默认为当前日期，key 可选值 minute、hour、day、month、year

## 消息及通知 / Message
> `window.M`，源文件为 packages/ui/src/components/naive-ui/NoticeProvider.vue

## 数据接口 / DataProvider
> 源文件为 packages/ui/public/data-api.js

## 辅助工具 / Helper
> `window.H`，源文件为 packages/ui/src/util/helper.js

模块|路径|说明
-|-|=
CORE|H.core|核心功能
EXCEL|H.excel|工作簿读写功能
IO|H.io|文件读写功能
AES|H.aes|AES 加解密功能
