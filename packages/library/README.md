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

## vite 打包配置
> vite.config.js

```js
import { defineConfig } from 'vite'

const VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: '../ui/public',
        lib:{
            entry: './index.js',
            name: 'H',
            formats: ['umd'],
            fileName: ()=> `meta-helper.js`
        }
    },
    define:{
        "_VERSION_": JSON.stringify(VERSION),
    },
    // 解决产物编码问题
    esbuild:{
        charset:'ascii'
    }
})
```
