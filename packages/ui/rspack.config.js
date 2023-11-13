const path = require('path')
const { HtmlRspackPlugin, DefinePlugin } = require("@rspack/core")
const { VueLoaderPlugin } = require("vue-loader")

const isProduction = process.env.NODE_ENV === 'production'

const pkg = require("./package.json")

let resolve = dir=>path.join(__dirname, dir)

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
        // console.group(`代理设置（ENV=${process.env.NODE_ENV}）：`)
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

/** @type {import('@rspack/cli').Configuration} */
const config = {
	context: __dirname,
	devtool: false,
	entry: "./src/main.js",
    devServer:{
        port: 3000
    },
    resolve:{
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
            '@U'            : resolve("src/util"),                          //通用工具
            '@F'            : resolve("src/views/快应用")
        }
    },
    output:{
        publicPath: isProduction? "/app-meta":"/",
        //默认生成的 js 文件名示例 src_Home_vue.js，这里修改为内容hash
        chunkFilename: "[contenthash].js",
    },
	plugins: [
        new VueLoaderPlugin(),
        new HtmlRspackPlugin({template:"./public/index.html"}),
        new DefinePlugin({
            "_APPNAME_": JSON.stringify(pkg.appName),
            "_VERSION_": JSON.stringify(isProduction? VERSION : process.env.NODE_ENV),
            "_CONTEXT_": JSON.stringify(process.env.VUE_APP_CONTEXT||""),
            "_APP_INFO_": JSON.stringify({ dependencies: pkg.dependencies, devDependencies: pkg.devDependencies })
        })
    ],
	module: {
		rules: [
			{ test: /\.vue$/, loader: "vue-loader", options: { experimentalInlineMatchResource: true }},
            { test: /\.less$/, loader: 'less-loader', type: 'css'},
            { test: /\.(txt|md|svg)/, type: "asset/resource" }
		]
	}
};
module.exports = config;
