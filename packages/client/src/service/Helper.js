const { join } = require("path")
const { BrowserWindow } = require("electron")
const C = require("../Config")
const R = require("../Runtime")
const logger = require("../common/logger")
const { getToken } = require("./Http")

const urlPrefix = process.env.WEBPACK_DEV_SERVER_URL? process.env.WEBPACK_DEV_SERVER_URL:"app://./"
const preload   = join(__dirname, '../preload/api-main.js')

/**
 * 构建 URL，返回字符串（区分开发环境与生产环境）
 * @param {*} suffix    后缀，注意，需要带上 /
 * @param {*} page      页面（多页面应用时需要传递）
 */
exports.buildUrl = (suffix="", page="index.html")=>{
    return `${urlPrefix}${page}${suffix}`
}

/**
 *
 * @param {String} suffix - 以 / 开头的后端资源
 * @returns String
 */
exports.buildRemoteUrl = suffix=> `${C.serverHost}${C.serverContext}${suffix}`

exports.mainPreload = preload

/**
 * 创建 main-preload 的窗口
 * @param {String} url
 * @param {Boolean} autoShow
 * @param {String} initCode
 * @returns
 */
exports.createMainWindow = (url, autoShow=true, initCode)=>{
    let win = new BrowserWindow({
        width           : C.windowWidth,
        height          : C.windowHeight + (R.isDev ? 150 : 0),
        show            : autoShow,
        fullscreen      : C.windowMax,
        // 背景透明
        // transparent: true,
        // mac标题栏
        // titleBarStyle: 'hiddenInset',
        backgroundColor : R.background,
        // 隐藏标题栏
        // frame: true,
        webPreferences  : {
            // nodeIntegration : process.env.ELECTRON_NODE_INTEGRATION,
            // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
            webSecurity     : false, //R.isDev? false: true,
            nativeWindowOpen: true,
            preload
        },
    })

    if(url && url.startsWith("http"))
        win.loadURL(url)

    if(initCode){
        R.verbose && logger.info(`创建新窗口 ${url} 并执行初始化代码`, initCode)

        // 对平台后台的访问均自动注入请求头
        // win.webContents.session.webRequest.onBeforeSendHeaders(
        //     {urls: [C.serverHost]},
        //     (details, callback)=>{
        //         details.requestHeaders["MUA"] = getToken()
        //         callback({ requestHeaders: details.requestHeaders })
        //     }
        // )
        win.webContents.once('dom-ready', ()=>{
            win.webContents.executeJavaScript(initCode)
                .then(result=> R.verbose && logger.info(`初始化脚本执行完成，返回值：${result}`))
                .catch(e => logger.error("执行初始化脚本出错：", e))
        })
    }

    // 开发模式下，自动打开 F12
    if(R.isDev){
        win.on('ready-to-show', ()=> win.webContents.openDevTools())
    }

    return win
}
