const { ipcRenderer } = require("electron")

let CommonAPI = {
    dateFormat(fmt = "yyyy-MM-dd hh:mm:ss", time = 0) {
        let date = time ? new Date(time) : new Date()
        let opt = {
            "y+": date.getFullYear().toString(),        // 年
            "M+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "h+": date.getHours().toString(),           // 时
            "m+": date.getMinutes().toString(),         // 分
            "s+": date.getSeconds().toString(),         // 秒
            "q+": Math.floor((date.getMonth() + 3) / 3)
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        }
        for (let k in opt) {
            let ret = new RegExp("(" + k + ")").exec(fmt)
            if (ret)
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
        return fmt
    },

    /**
     * 闪烁框：在Windows上，你可以突出显示任务栏按钮以获得用户的关注。 这与在macOS上弹跳停靠栏图标相似
     */
    flash() {
        ipcRenderer.send("flash")
    },

    setTitle(title) {
        ipcRenderer.send("set-title", title)
    },

    /**
     * 显示系统通知
     * @param {*} msg
     * @param {*} title
     */
    notification(msg, title = "通知", ps) {
        // let notice = new Notification(title, { body: msg })
        ipcRenderer.send("notification", msg, title, ps)
    },

    /**
     * 保存当前页面为 PDF 文档
     * @param {*} filename 文件名
     */
    toPdf(filename = "index") {
        ipcRenderer.send("export-pdf", filename)
    },

    /**
     * 日志组件
     */
    log(msg, level = "info") {
        console.log("log", window.__UUID__)
        ipcRenderer.send("log", msg, level)
    },

    error(msg) {
        ipcRenderer.send("log", msg, "error")
    },

    /**
     *
     * @param {*} state
     * @param {*} file
     */
    onDownloadDone(state, file) {
        console.log('---------------文件下载完成的回调，如果有自定义操作请重写 META.onDownloadDone 方法---------------')
        console.log(`state=${state}, file=${file}`)
        console.log()
    },

    /**
     * 执行自定义函数，参数一为函数ID，其他参数将一一传递给函数本身
     * @param {*} id
     * @param  {...any} ps
     * @returns
     */
    callFunc(id, ...ps) {
        return ipcRenderer.invoke("callFunc", id, ...ps)
    },

    //=====================================================================================================
    /**
     * 测试主进程与渲染经常的通信
     */
    test(args) {
        ipcRenderer.send("test", args)
    }
}

module.exports = CommonAPI
