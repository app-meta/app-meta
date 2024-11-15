# APP 元宇宙/UI

## 二次开发

### 问题集锦

* 热更新无效（HMR）
> 需要重载页面方可看到修改的效果

原因未明，此时两个解决方法

1. 删除根目录的 node_modules，重新进行`pnpm i`
2. 删除配置项`config.cache`（见 vue.config.js 文件）

## 附录

### 工具库

名称|说明
-|-
[MD-Editor-V3](https://github.com/imzbf/md-editor-v3)|一款专为Vue3设计的Markdown编辑器，配有深色主题
[pako](http://nodeca.github.io/pako)|文本压缩、还原工具
[mustache](https://github.com/janl/mustache.js)|JS 模板引擎
[mammoth](https://github.com/mwilliamson/mammoth.js)|转换 docx 文件到 html
[html-to-docx](https://github.com/privateOmega/html-to-docx)|将 html 转换为 word
[html2pdf.js](https://github.com/eKoopmans/html2pdf.js)|将 html 元素转换为 PDF（canvas 方式）

### 打包后体积

日期|原始大小|压缩大小|说明
-|-|-|-
2023-03-10|4.44M|`7z`1014KB|
2023-03-22|4.56M|`7z`1053KB|增加 `lodash`、`pako` 库
2023-04-12|6.1M|`7z`1350KB|增加`echarts`
2023-04-13|6.28MB|`7z`1378KB|增加`docx-preview`库
2023-05-09|6.8MB|2304KB|增加`font-awesome`图标库
2023-05-12|7.65MB|2630KB|增加`dompurify`、`html2pdf.js`库
2023-06-02|9.10MB|3003KB|增加`vue3-sfc-loader`库
2023-08-08|12.3MB|4004KB|增加`mermaid`库（渲染 uml）
2024-03-26|9.12MB|3206KB|打包工具更换为`vite5`
2024-03-29|9.57MB|3353KB|增加`vant4`（SFC组件）
2024-03-29|10.2MB|3552KB|增加`varlet`（SFC组件）
2024-05-14|16.0MB|5952KB|增加`md-editor-v3`编辑器

### vite 打包配置
> vite.config.mjs

```js
import { join } from 'path'

import { defineConfig, createLogger } from 'vite'
import vue from '@vitejs/plugin-vue'

const isProduction = process.env.NODE_ENV === 'production'

const MARKDOWN = 'v3'

const resolve = dir=>join(__dirname, dir)
const pkg = require("./package.json")

const BACKEND_CONTEXT   = "/app-meta"      //后端服务地址前缀
const BACKEND_HOST      =  "http://localhost:10086"

const VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

const customLogger = (()=>{
    const logger = createLogger()
    logger.warn = (msg, options) => {}
    return logger
})()

// https://vitejs.dev/config/
export default defineConfig({
    base: isProduction? `${BACKEND_CONTEXT}/`: "/",
    server:{
        port: 3000,
        host: "localhost",
        proxy: { [BACKEND_CONTEXT]: BACKEND_HOST }
    },
    resolve:{
        extensions: ['.js', '.vue', '.json', ".css"],
        alias:{
            '@P'            : resolve('public'),
            '@'             : resolve('src'),                               //代码目录
            '@M'            : resolve("src/components/macro"),              //宏组件
            '@C'            : resolve("src/components"),                    //常用组件
            '@CN'           : resolve("src/components/naive-ui"),           //常用组件（适配 NaiveUI）
            '@CC'           : resolve("src/components/common"),             //常用组件（通用）
            '@CM'           : resolve("src/components/mixin"),              //mixin 组件
            '@Pagination'   : resolve("src/components/mixin/Pagination"),
            '@V'            : resolve("src/views"),                         //视图目录
            '@VW'           : resolve("src/views/widget"),
            '@Store'        : resolve("src/store"),
            '@S'            : resolve("src/service"),                       //接口相关
            '@T'            : resolve("src/theme"),                         //主题相关
            '@U'            : resolve("src/util"),                          //通用工具
            '@F'            : resolve("src/views/快应用"),
            '@md.viewer'    : resolve(`src/components/markdown/${MARKDOWN}/md.viewer.vue`),
            '@md.editor'    : resolve(`src/components/markdown/${MARKDOWN}/md.editor.vue`),
            '@code.editor'  : resolve(`src/components/code/codemirror.vue`),//代码编辑器，可选：codemirror、monaco（VsCode）
        }
    },
    define:{
        //关闭 vue3 的警告信息
        "__VUE_OPTIONS_API__": true,
        "__VUE_PROD_DEVTOOLS__": false,
        "__VUE_PROD_HYDRATION_MISMATCH_DETAILS__": false,
        "process.env.VUE_APP_CONTEXT": JSON.stringify(BACKEND_CONTEXT),
        "_MARKDOWN_LIB_": JSON.stringify(MARKDOWN),
        "_APPNAME_": JSON.stringify(pkg.appName),
        "_VERSION_": JSON.stringify(isProduction? VERSION : process.env.NODE_ENV),
        "_CONTEXT_": JSON.stringify(process.env.VUE_APP_CONTEXT||""),
        "_APP_INFO_": JSON.stringify({ dependencies: pkg.dependencies, devDependencies: pkg.devDependencies })
    },
    build:{
        assetsDir:"static/assets",
        chunkSizeWarningLimit: 5000,
        reportCompressedSize: false,
        rollupOptions:{
            output:{
                assetFileNames: "static/assets/[hash][extname]",
                chunkFileNames: "static/js/[hash].js",
                entryFileNames: "static/js/[name].[hash].js"
            }
        }
    },
    customLogger,
    plugins: [
        vue(),
        // ViteCompress({
        //     algorithm: 'gzip',
        //     deleteOriginalAssets: true,
        //     exclude:[/\.(png|gz|html|svg)$/],
        //     threshold: 1024 * 1024
        // }),
        // 修改 html 的标题
        {
            name:"repair-html-title",
            transformIndexHtml: (/**@type {String} */ html)=> html.replace("<%= title %>", pkg.appName)
        }
    ]
})
```
