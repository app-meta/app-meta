const { join } = require("path")
const { BrowserWindow } = require("electron")
const C = require("../Config")
const R = require("../Runtime")

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
        win.webContents.executeJavaScript(initCode)
    }

    // 开发模式下，自动打开 F12
    if(R.isDev){
        win.on('ready-to-show', ()=> win.webContents.openDevTools())
    }

    return win
}
