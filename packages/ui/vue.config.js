const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const CompressionWebpackPlugin = require('compression-webpack-plugin')

const isProduction = process.env.NODE_ENV == 'production'

const pkg = require("./package.json")
const moduleName = process.env.npm_config_module||""
if(moduleName)  console.debug(`指定模块为 ${moduleName} （将影响到具体的路由、MOCK 等）`)

let resolve = dir=>path.join(__dirname,dir)

let VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

let devServer = {
    // host:"0.0.0.0",
    port: 3000,
    hot: true, // 热更新
    client: {
        overlay: {
            warnings: false,
            errors: true
        }
    },
    proxy: (() => {
         //url 前缀 与 映射地址，如："/booking" : "http://localhost:8080"
        let targets = {
            /** 针对附件的映射 */
            // "/attach" : "http://localhost:10086/app-meta"
        }
        targets[process.env.VUE_APP_CONTEXT] = process.env.VUE_APP_HOST

        let proxy = {}
        console.group(`代理设置（ENV=${process.env.NODE_ENV}）：`)
        Object.keys(targets).forEach(k => {
            proxy[k] = {
                target: targets[k],
                changeOrigin: false,
                secure: false
                //ws: true,//websocket支持
            }
            console.debug(`\t${k} >> ${targets[k]}`)
        })
        console.groupEnd()
        return proxy
    })()
}

let pages = {
    index   : 'src/main.js'
}

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
    publicPath: isProduction? "/app-meta":"/",
    assetsDir:"static",
    pages,
    productionSourceMap: false,
    configureWebpack: config => {
        /**
         * 构建提速设置
         *  配置如下：
            Windows 11 家庭中文版
            版本	21H2
            操作系统版本	22000.1098
            处理器	11th Gen Intel(R) Core(TM) i5-11300H @ 3.10GHz   3.11 GHz
            机带 RAM	16.0 GB (15.8 GB 可用)

            构建速度约为 2100ms（未优化前为 14000 ms 左右）
         */
        // Webpack5 简单的配置 cache 属性可大大提高构建速度（约 600% 的加速）
        config.cache = {
            type: 'filesystem', //'memory'
            // allowCollectingMemory: true
        },
        config.optimization.concatenateModules = false
        config.optimization.usedExports = false
        // 优化压缩工具提速可忽略不计...
        // npm i -D esbuild
        // const TerserPlugin = require('terser-webpack-plugin')
        // config.optimization.minimizer = [
        //     new TerserPlugin({
        //         minify: TerserPlugin.esbuildMinify,
        //         terserOptions: {},
        //     })
        // ]

        config.resolve = {
            extensions: ['.js', '.vue', '.json', ".css"],
            alias: {
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
                '@U'            : resolve("src/util")                           //通用工具
            }
        }

        config.plugins.push(
            /**
             * 增加全局变量（名称以 _ 开始及结尾）
             * 代码中如何使用:
             *  1、打印     console.debug(_MODULE_)
             *  2、逻辑     if(_MODULE_=='kaoping') {}
             */
            new webpack.DefinePlugin({
                "_APPNAME_": JSON.stringify(pkg.appName),
                "_VERSION_": JSON.stringify(isProduction? VERSION : process.env.NODE_ENV),
                "_MODULE_": JSON.stringify(moduleName),
                "_CONTEXT_": JSON.stringify(process.env.VUE_APP_CONTEXT||""),
                "_APP_INFO_": JSON.stringify({ dependencies: pkg.dependencies, devDependencies: pkg.devDependencies })
            })
        )

        if(isProduction && process.env.npm_lifecycle_script.indexOf("--gzip")>=0){
            console.debug(`\n启用 WebPack 压缩插件（超过 400 KB 的文件将被压缩）...\n`)
            config.plugins.push(
                new CompressionWebpackPlugin({
                    test: /\.(js|css)$/,
                    threshold: 400 * 1024,            // 超过400kb的文件就压缩
                    deleteOriginalAssets: true,     // 是否删除原始文件
                    minRatio: 0.8
                })
            )
        }
        config.target = "web",
        /**
         * txt、md 类文件的引入
         * 详见 https://webpack.js.org/guides/asset-modules
         */
        config.module.rules.push(
            { test: /\.(txt|md)/, type: 'asset/source' }
        )
    },
    devServer
}
