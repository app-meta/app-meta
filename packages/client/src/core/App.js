/**
 * 应用相关功能封装
 */
const { join } = require('path')

const { BrowserWindow, nativeImage } = require("electron")
const logger = require("../common/logger")
const C = require("../Config")
const R = require("../Runtime")
const { buildUrl } = require('../service/Helper')

const preload   = join(__dirname, './api-main.js')

/**
 * 对于将 resources 资源打包到 asar
 *      访问路径参考 join(__dirname, `../../resource/icon/${name}.png`)
 *
 * 对于不打包
 *
 * @param {*} name
 * @returns
 */
const iconPath  = name=> R.resDir(`icon/${name}.png`)
const _icon     = name=> nativeImage.createFromPath(iconPath(name))

exports.icons = {
    logo    : _icon("logo"),
    about   : _icon("about"),
    refresh : _icon("refresh"),
    quit    : _icon("quit")
}

exports.loadAndStart = (app)=>{
    if(!(typeof(app)==='object' && !!app.id && !!app.name))
        throw Error(`无效参数（应用编号不能为空）`)

    logger.info(`请求运行应用 ${app.id}/${app.name}`)
    let appWindow = new BrowserWindow({
        show            : false,
        frame           : app.winFrame !== false,
        fullscreen      : app.winMax === true,
        width           : app.winWidth || C.windowWidth,
        height          : (app.winHeight || C.windowHeight) + (R.isDev?180:0),
        title           : app.name,
        webPreferences  : {
            contextIsolation: true,
            nodeIntegration: false,
            preload
        }
    })
    appWindow.setMenu(null)

    appWindow.on('ready-to-show', ()=>{
        appWindow.show()

        if(R.isDev) appWindow.webContents.openDevTools()
    })
    appWindow.on('close', async ()=>{
        logger.debug(`${app.name} 应用窗口即将关闭...`)
    })

    appWindow.loadURL(buildUrl(`/#/app/run/${app.id}`))
}

exports.iconPath = iconPath
