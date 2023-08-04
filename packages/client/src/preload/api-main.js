const { ipcRenderer, contextBridge } = require("electron")

let listeners = {}

let name = (channel, uuid)=>`${uuid}-${channel}`

/**
 * 扩展 SDK 对象，添加任务相关方法
 * 支持 this 对象引用
 */
contextBridge.exposeInMainWorld('META', {
    //============================= START 常用接口封装 START ==========================
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
    notify(msg, title = "通知") {
        // let notice = new Notification(title, { body: msg })
        ipcRenderer.send("notification", msg, title)
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

    /**
     * 测试主进程与渲染经常的通信
     */
    test(args) {
        ipcRenderer.send("test", args)
    },
    //============================= END 常用接口封装 END ==========================

    //远程 api 调用
    remote (prefix, ...ps){
        return ipcRenderer.invoke('remote-api', prefix, ...ps)
    },

    //本地交互式调用， ipcMain 需要使用 handle 监听
    api (channel, ...ps){
        return ipcRenderer.invoke(channel, ...ps)
    },

    //非交互式 api 调用， ipcMain 使用 on 监听
    send (channel, ...ps){
        ipcRenderer.send(channel, ...ps)
    },

    addListener (channel, handler, uuid=0){
        console.debug(`[MAIN] 添加事件监听器 ${channel} (UID=${uuid})`)

        let proxyHandler = (_, ...ps)=> handler(...ps)
        listeners[name(channel, uuid)] = proxyHandler
        ipcRenderer.on(channel, proxyHandler)
    },

    addListenerOnce (channel, handler){
        console.debug(`[MAIN] 添加事件单次监听器 ${channel}`)
        ipcRenderer.once(channel, (_, ...ps)=> handler(...ps))
    },

    removeListener (channel, uuid=0){
        console.debug(`[MAIN] 移除事件监听器 ${channel} (UID=${uuid})`)

        let funcName = name(channel, uuid)
        ipcRenderer.removeListener(channel, listeners[funcName])
        delete listeners[funcName]
    },

    removeAllListener (channel){
        ipcRenderer.removeAllListeners(channel)
    },

    // 启动指定的机器人
    runRobot: (id, params={}) => ipcRenderer.invoke('robot.run', id, params),

    // 将指定文本复制到粘贴板中
    copyText: text=> ipcRenderer.send('copyText', text),

    token : v=> ipcRenderer.invoke('app.token', v),

    // openLocalUrl : (url, withToken=true) => ipcRenderer.invoke("open-local-url", url, withToken)
})
