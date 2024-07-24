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

|方法|说明|
|-|-|
|ok(text:String)|在页面顶部弹出`绿色`消息通知|
|info(text:String)|在页面顶部弹出`蓝色`消息通知|
|warn(text:String)|在页面顶部弹出`橙色`消息通知|
|error(text:String)|在页面顶部弹出`红色`消息通知|
|confirm(title,msg,onOk,onCancel)|显示带标题及详细内容（移动端支持`\n`换行）以及**确认**、**我再想想**两个按钮的确认框|
|notice.ok(msg,title="操作成功")|在右上角（移动端为中间）显示操作成功的信息|
|notice.info(msg,title="提示")|在右上角（移动端为中间）显示提示|
|notice.warn(msg,title="警告")|在右上角（移动端为中间）显示警告信息|
|notice.error(msg,title="操作失败")|在右上角（移动端为中间）显示操作失败的信息|
|dialog(ps={title:"操作确认"})|创建灵活的对话框，暂未做兼容，参数请见终端对应组件库的文档（PC端 `naive-ui`，移动端 `vant4`）|
|showError(msg,title="应用执行出错")|以对话框形式（需要用户点击按钮才可消失）显示报错信息，支持 `HTML` 代码|
|showData(data:Array/Object, ps={})|以对话框展示复杂信息|
|alert(msg,ps:Object/String)|弹出消息对话框，参数 ps 若为字符串则作为标题（详见`vant4`）|
|prompt(title="请输入",ps={}):Promise|弹出输入框，ps 可设置 theme、icon（是否显示图标）、type（可选text、number、textarea）|

**showData 方法参数详解**


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
