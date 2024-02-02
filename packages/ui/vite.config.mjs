import { join } from 'path'

import { defineConfig, createLogger } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import commonjs from '@rollup/plugin-commonjs'

const isProduction = process.env.NODE_ENV === 'production'

const resolve = dir=>join(__dirname, dir)
const pkg = require("./package.json")

const BACKEND_CONTEXT   = "/app-meta"      //后端服务地址前缀
const BACKEND_HOST      =  "http://localhost:10086"
const BASE_URL          = isProduction ? BACKEND_CONTEXT : ""

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
            '@F'            : resolve("src/views/快应用")
        }
    },
    define:{
        //关闭 vue3 的警告信息
        "__VUE_OPTIONS_API__": true,
        "__VUE_PROD_DEVTOOLS__": false,
        "__VUE_PROD_HYDRATION_MISMATCH_DETAILS__": false,
        "process.env.VUE_APP_CONTEXT": JSON.stringify(BACKEND_CONTEXT),
        "_APPNAME_": JSON.stringify(pkg.appName),
        "_VERSION_": JSON.stringify(isProduction? VERSION : process.env.NODE_ENV),
        "_CONTEXT_": JSON.stringify(process.env.VUE_APP_CONTEXT||""),
        "_APP_INFO_": JSON.stringify({ dependencies: pkg.dependencies, devDependencies: pkg.devDependencies })
    },
    build:{
        assetsDir:"static/assets",
        chunkSizeWarningLimit: 5000,
        rollupOptions:{
            output:{
                assetFileNames: "static/assets/[hash:12][extname]",
                chunkFileNames: "static/assets/[hash:12].js"
            }
        }
    },
    customLogger,
    plugins: [
        // commonjs(),
        vue(),
        createHtmlPlugin({
            inject:{
                data:{
                    title: pkg.appName,
                   //配置模板参数，通过 <%= 变量名 %> 使用，此处模拟 vue-cli 中的前缀目录
                    BASE_URL
                },
                /*
                动态注入静态资源，不然打包时会报警告信息：doesn't exist at build time, it will remain unchanged to be resolved at runtime

                <link href="<%= BASE_URL %>/static/font-awesome/css/fontawesome.min.css" rel="stylesheet">
                <link href="<%= BASE_URL %>/static/font-awesome/css/brands.min.css" rel="stylesheet">
                <link href="<%= BASE_URL %>/static/font-awesome/css/solid.min.css" rel="stylesheet">
                <link href="<%= BASE_URL %>/static/font-awesome/css/regular.min.css" rel="stylesheet">
                */
                // tags: ["fontawesome", "brands", "solid", "regular"].map(v=>({
                //     tag:'link',
                //     attrs:{ rel:"stylesheet", href:`${BASE_URL}/static/font-awesome/css/${v}.min.css` },
                //     injectTo:'head'
                // }))
            }
        })
    ]
})
