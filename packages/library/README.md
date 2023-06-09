# 工具封装
> 封装常用功能（通常赋值到 全局对象 H 中），打包后文件存放到 packages/ui/public/meta-helper.js

## 如何引用

对于`ui`项目

```javascript
import * as H from "./library"

window.H = H
```

对于`小程序`则通过 script 标签引入

```html
<script src="/meta-help.js"></script>
```
