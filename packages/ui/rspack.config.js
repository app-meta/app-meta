const path = require('path')
const { HtmlRspackPlugin, DefinePlugin, CopyRspackPlugin } = require("@rspack/core")
const { VueLoaderPlugin } = require("vue-loader")

const isProduction = process.env.NODE_ENV === 'production'

const pkg = require("./package.json")

const BACKEND_CONTEXT   = "/app-meta"      //后端服务地址前缀
const BACKEND_HOST      =  "http://localhost:10086"

let resolve = dir=>path.join(__dirname, dir)

let VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

/** @type {import('@rspack/cli').Configuration} */
const config = {
	context: __dirname,
	devtool: false,
	entry: "./src/main.js",
    devServer:{
        port: 3000,
        client: { progress: false },
        proxy: { [BACKEND_CONTEXT]: BACKEND_HOST },
        client: {
            overlay: false
        }
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
        //在生成产物前，删除输出目录下的所有文件
        clean: true,
        publicPath: isProduction? `${BACKEND_CONTEXT}/` : "/",
        filename: `static/js/[name].[contenthash].js`,
        //默认生成的 js 文件名示例 src_Home_vue.js，这里修改为内容hash
        //优化缓存策略：增加时间戳版本号
        chunkFilename: `static/js/[contenthash].js`,   //?v=${timestamp}
        assetModuleFilename: "static/asset/[hash][ext][query]",
    },
	plugins: [
        new VueLoaderPlugin(),
        new HtmlRspackPlugin({
            template:"./index.html",
            title: pkg.appName,
            templateParameters: {
                //配置模板参数，通过 <%= 变量名 %> 使用，此处模拟 vue-cli 中的前缀目录
                "BASE_URL": isProduction ? BACKEND_CONTEXT : ""
            },
            minify: false
        }),
        //如果需要拷贝静态资源，请使用下方配置
        new CopyRspackPlugin({patterns:[{from:"public", to:""}]}),
        new DefinePlugin({
            //关闭 vue3 的警告信息
            "__VUE_OPTIONS_API__": true,
            "__VUE_PROD_DEVTOOLS__": false,
            "process.env.VUE_APP_CONTEXT": JSON.stringify(BACKEND_CONTEXT),
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
            { test: /\.(txt|svg)/, type: "asset/resource" },
            { test: /\.md/, type: 'asset/source' },
            {
                test: /\.js$/, exclude: /node_modules/, loader: 'builtin:swc-loader',
                options: {
                    //兼容低版本浏览器
                    env: { targets: "chrome >= 68" }
                },
                type: 'javascript/auto'
            }
		]
	},
    experiments:{
        rspackFuture:{
            disableTransformByDefault: true,
            disableApplyEntryLazily: false
        }
    }
};
module.exports = config;
