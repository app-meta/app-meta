import { defineConfig } from "@rsbuild/core"
import { pluginVue } from "@rsbuild/plugin-vue"
import { pluginLess } from '@rsbuild/plugin-less'

// import AutoImport from 'unplugin-auto-import/rspack'
// import Components from 'unplugin-vue-components/rspack'
// import { NaiveUiResolver } from "unplugin-vue-components/resolvers"

const isProduction = process.env.NODE_ENV === 'production'

const MARKDOWN = 'v3'

import pkg from './package.json'

const BACKEND_CONTEXT   = "/app-meta"      //后端服务地址前缀
const BACKEND_HOST      =  "http://localhost:10086"

const VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

/**
 * 2024-11-14 更新到 rsbuild，构建时间 23s（vite 为 56s）
 */
export default defineConfig({
    server:{
        base: isProduction? `${BACKEND_CONTEXT}/`: "/",
        port: 3000,
        host: "localhost",
        proxy: { [BACKEND_CONTEXT]: BACKEND_HOST }
    },
    source:{
        entry: {
            index: './src/main.js'
        },
        alias:{
            "@"             : "./src",
            "@V"            : "./src/views",
            "@C"            : "./src/components",
            "@CP"           : "./src/composables",
            "@CW"           : "./src/components/widget",
            "@CA"           : "./src/components/app",
            '@Pagination'   : "./src/components/mixin/Pagination",
            '@P'            : "./public",
            '@'             : "./src",                               //代码目录
            '@M'            : "./src/components/macro",              //宏组件
            '@C'            : "./src/components",                    //常用组件
            '@CN'           : "./src/components/naive-ui",           //常用组件（适配 NaiveUI）
            '@CC'           : "./src/components/common",             //常用组件（通用）
            '@CM'           : "./src/components/mixin",              //mixin 组件
            '@Pagination'   : "./src/components/mixin/Pagination",
            '@V'            : "./src/views",                         //视图目录
            '@VW'           : "./src/views/widget",
            '@Store'        : "./src/store",
            '@S'            : "./src/service",                       //接口相关
            '@T'            : "./src/theme",                         //主题相关
            '@U'            : "./src/util",                          //通用工具
            '@F'            : "./src/views/快应用",
            '@md.viewer'    : `./src/components/markdown/${MARKDOWN}/md.viewer.vue`,
            '@md.editor'    : `./src/components/markdown/${MARKDOWN}/md.editor.vue`,
            '@code.editor'  : `./src/components/code/codemirror.vue`,//代码编辑器，可选：codemirror、monaco（VsCode）

        },
        define:{
            "process.env.VUE_APP_CONTEXT": JSON.stringify(BACKEND_CONTEXT),
            "_MARKDOWN_LIB_": JSON.stringify(MARKDOWN),
            "_APPNAME_": JSON.stringify(pkg.appName),
            "_VERSION_": JSON.stringify(isProduction? VERSION : process.env.NODE_ENV),
            "_CONTEXT_": JSON.stringify(process.env.VUE_APP_CONTEXT||""),
            "_APP_INFO_": JSON.stringify({ dependencies: pkg.dependencies, devDependencies: pkg.devDependencies })
        },
    },
    html:{
        title: pkg.appName,
        mountId: "app"
    },
    output:{
        // distPath:{
        //     js:"static/js",
        //     css:"static/css"
        // },
        legalComments: 'none'
    },
    plugins:[
        pluginVue(), pluginLess()
    ],
    tools:{
        //兼容 ?raw 的资源引用
        rspack: {
            module: {
                rules: [
                    {
                        resourceQuery: /raw/,
                        type: 'asset/source',
                    },
                ],
            },
        }
    }
})
