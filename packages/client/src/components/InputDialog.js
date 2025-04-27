const { join } = require('node:path')

const { BrowserWindow, ipcMain } = require("electron")
const logger = require("../common/logger")
const R = require("../Runtime")
const { buildHtmlUrl } = require('../service/Helper')

const preload   = join(__dirname, '../preload/api-io.js')

const inputTypes = {
    TEXT        : "text",
    PASSWORD    : "password",
    CODE        : "code",
    TEXTAREA    : "textarea"
}

module.exports = {
    inputTypes,

    /**
     * 弹出输入对话框
     * @param {String} title
     * @param {String} type - 输入框类型，可以是 text，password，code， textarea
     * @param {BrowserWindow} parentWin - 父窗口，默认是当前聚焦窗口
     * @returns {String}
     */
    inputDialog : (title, type=inputTypes.TEXT, defaultVal="", parentWin)=> new Promise(ok=>{
        let parent = parentWin || BrowserWindow.getFocusedWindow()
        let { width, height } = parent.getBounds()

        const inputWin = new BrowserWindow({
            title,
            width: parseInt(width * 0.8),
            height: type==inputTypes.TEXT||type==inputTypes.PASSWORD? 180 : Math.min(height * 0.8, 420),
            modal: true,
            parent,
            webPreferences:{
                preload
            }
        })

        ipcMain.once('dialog.input', (e, value)=>{
            R.isDev && logger.debug(`接收到渲染进程的输入值：`, value)
            ok(value)

            inputWin.destroy()
        })

        inputWin.loadURL(buildHtmlUrl(`/index.html#/client-input?type=${type}`))
    })
}
