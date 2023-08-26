const { BrowserWindow, globalShortcut } = require("electron")
const logger = require("../common/logger")
const R = require("../Runtime")

let withMainWindow = chain=>{
    let win = BrowserWindow.fromId(R.mainWindowID)
    if (win && win.webContents) {
        chain(win.webContents)
    }
}

/**
 * 发送事件到主窗口
 * @param {*} channel
 * @param {*} ps
 */
const sendEvent = (channel, ps)=>{
    withMainWindow(web=>{
        web.send(channel, ps)
        if(R.isDev) logger.debug(`[GLOBAL] 发送 ${channel} 事件到主窗口: `, ps)
    })
}

/**
 * 保存文本数据到特定文件
 * @param {*} content
 * @param {*} file
 */
const saveStringToFile = (content, file) => {
    logger.info(`[GLOBAL] 保存文本到：${file}`)
    fs.writeFileSync(path.resolve(file), content, { encoding: Config.encoding })
}

/**
 * 给全部窗口广播事件
 * @param {String} channel
 * @param {Number} ignoreWindowId
 * @param  {...any} ps
 */
const broadcast = (channel, ignoreWindowId, ...ps)=>{
    R.isDev && logger.debug(`[GLOBAL] 广播事件 ${channel}`, ps)
    for(let win of BrowserWindow.getAllWindows()){
        if(win.id == ignoreWindowId)    continue

        win.webContents.send(channel, ...ps)
        R.isDev && logger.debug(`[GLOBAL] 广播事件 ${channel} 到窗口 #${win.id}`)
    }
}

module.exports ={
    init (){
        globalShortcut.register('CommandOrControl+F12', () => {
            withMainWindow(web=> web.openDevTools())
        })
    },

    /**
     * 发布 worker-update 事件到主窗口
     * @param {*} worker
     */
    onWorkerUpdate (worker){
        sendEvent("worker-update", worker)
    },


    sendEvent,

    /**
     * 发送通知到主窗口告之用户相关信息
     * @param {*} msg
     * @param {*} title
     * @param {*} type
     */
    sendNotice (msg, title, type = "info") {
        withMainWindow( web=> {
            web.send('notice', msg, title, type)
            R.isDev && logger.debug(`[GLOBAL] 发送 NOTICE·${type} 到主窗口：title=${title} msg=${msg}`)
        })
    },

    broadcast,

    /**
     * 给全部窗口广播事件
     * @param {String} channel
     * @param  {...any} ps
     */
    broadcastAll (channel, ...ps){
        broadcast(channel, null, ...ps)
    },

    saveStringToFile,

    /**
     * 弹出文件选择对话框并写入内容到文件
     * @param {*} content
     * @param {*} filename
     */
    saveStringToFileWithSelect(content, filename) {
        let result = dialog.showSaveDialogSync({ title: "保存到", message: "保存到", defaultPath: filename })
        R.isDev && logger.debug(`[GLOBAL] 保存数据，选择的文件为：`, result)

        if (result)
            saveStringToFile(content, result)
        else
            R.isDev && logger.debug(`[GLOBAL] 用户取消了保存...`)
    }
}
