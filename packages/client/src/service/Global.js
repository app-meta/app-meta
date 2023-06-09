const { BrowserWindow, globalShortcut } = require("electron")
const logger = require("../common/logger")
const R = require("../Runtime")

let withMainWindow = chain=>{
    let win = BrowserWindow.fromId(R.mainWindowID)
    if (win && win.webContents) {
        chain(win.webContents)
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
        this.sendEvent("worker-update", worker)
    },

    /**
     * 发送事件到主窗口
     * @param {*} channel
     * @param {*} ps
     */
    sendEvent(channel, ps) {
        withMainWindow(web=>{
            web.send(channel, ps)
            logger.debug(`发送 ${channel} 事件到主窗口: `, ps)
        })
    },

    /**
     * 发送通知到主窗口告之用户相关信息
     * @param {*} msg
     * @param {*} title
     * @param {*} type
     */
    sendNotice(msg, title, type = "info") {
        withMainWindow( web=> {
            web.send('notice', msg, title, type)
            logger.debug(`发送 NOTICE·${type} 到主窗口：title=${title} msg=${msg}`)
        })
    },

    /**
     * 保存文本数据到特定文件
     * @param {*} content
     * @param {*} file
     */
    saveStringToFile(content, file) {
        logger.info(`保存文本到：${file}`)
        fs.writeFileSync(path.resolve(file), content, { encoding: Config.encoding })
    },

    /**
     * 弹出文件选择对话框并写入内容到文件
     * @param {*} content
     * @param {*} filename
     */
    saveStringToFileWithSelect(content, filename) {
        let result = dialog.showSaveDialogSync({ title: "保存到", message: "保存到", defaultPath: filename })
        logger.debug(`保存数据，选择的文件为：`, result)

        if (result)
            this.saveStringToFile(content, result)
        else
            logger.debug(`用户取消了保存...`)
    }
}
