const { ipcRenderer, contextBridge } = require("electron")
// 不支持导入 js 文件
// const CommonAPI = require("./api-common")
const PROGRESS = 'progress'

const log = (msg, ...ps)=>console.debug(`%c[数据接口] ${msg}`, "background:#8c0776;padding:3px;color:white", ...ps)

const data = {
    insert  : (rows)=> ipcRenderer.invoke("data.insert", rows),
    query   : (modelOrId={})=>ipcRenderer.invoke("data.query", modelOrId),
    getBlock: uuid=> ipcRenderer.invoke("data.getBlock", uuid),
    /**
     * 在机器人中设置 block 数据
     * @param {String} uuid
     * @param {String|Object} textOrObj
     * @returns
     */
    setBlock: (uuid, textOrObj)=> {
        log(`SET-BLOCK ID=${uuid}`)
        return ipcRenderer.invoke("data.setBlock", uuid, typeof(textOrObj)==='string'? textOrObj: JSON.stringify(textOrObj))
    }
}

contextBridge.exposeInMainWorld('META', {
    /**
     * 闪烁框：在Windows上，你可以突出显示任务栏按钮以获得用户的关注。 这与在macOS上弹跳停靠栏图标相似
     */
    flash () {
        ipcRenderer.send("flash")
    },

    setTitle (title) {
        ipcRenderer.send("set-title", title)
    },

    /**
     * 显示系统通知
     * @param {*} body
     * @param {*} title      "网页机器人通知"
     */
    notify (body, title) {
        ipcRenderer.send("notify", title, body)
    },

    /**
     * 日志组件
     */
    log (msg, level="info"){
        log(`[${level.toUpperCase()}]`, msg)
        ipcRenderer.send("log-robot", msg, level.toLowerCase())
    },

    /**
     * 延迟执行，用法：META.sleep(2000).then(doSomething())
     * @param {*} timeout 单位为毫秒
     */
    sleep (timeout){
        return new Promise(resolve => setTimeout(resolve, timeout))
    },

    progress (p, info=""){
        ipcRenderer.send(PROGRESS, p, info)
    },

    /**
     * 任务成功
     * @param {*} msg       任务完结信息
     * @param {*} timeout   延迟执行，单位为毫秒，仅当大于1000时进行延迟执行处理
     */
    async finish(msg, timeout = 0) {
        if (timeout >= 1000)
            await new Promise(ok => setTimeout(ok, timeout))

        console.debug(`[ROBOT 申请完结任务] ${msg}`)
        ipcRenderer.send(PROGRESS, 100, msg)
    },

    /**
     * 任务失败
     * @param {*} msg
     * @param {*} timeout
     */
    async failed(msg, timeout = 0) {
        if (timeout >= 1000)
            await new Promise(ok => setTimeout(ok, timeout))

        console.debug(`[ROBOT 申请失败任务] ${msg}`)
        ipcRenderer.send(PROGRESS, -1, msg)
    },

    data,

    /**
     * 缓存数据，将在下一次代码执行中被读取
     * @param {*} key
     * @param {*} data
     */
    cache (key, data){
        ipcRenderer.send("cache", key, data)
    },

    /**
     * 保存数据到 CSV 文件
     * @param {*}} data     数据对象
     * @param {*} name      CSV 文件名（不带后缀）
     * @param {*} split     字段分隔符
     */
    csv (data, name="default", split=","){
        ipcRenderer.send("csv", data, name, split)
    },

    /**
     * 下载某个url内容
     * @param {*} url       远程地址
     * @param {*} filename  文件名
     */
    download (url, filename){
        ipcRenderer.send("download", url, filename)
    },

    /**
     * 将 img 对象转换为 Base64 格式
     * @param {*} imgSelector   图片选择器，如 #img
     * @param {*} scale         缩放，默认 1
     * @param {*} withGray      是否进行灰度处理，默认 true
     * @param {*} format        图片格式
     * @returns
     */
    imgToBase64(imgSelector, scale = 1.0, withGray=true, format = "image/jpeg") {
        let img = document.querySelector(imgSelector)
        if (!img) throw Error(`图片（${imgSelector}）不存在`)

        let canvas = document.createElement("canvas")
        let ctx = canvas.getContext("2d")
        let { width, height } = img
        canvas.width = width * scale
        canvas.height = height * scale
        ctx.drawImage(img, 0, 0, width, height, 0, 0, canvas.width, canvas.height)

        //灰度处理，一定程度上使得图片内字符更加清晰
        if (withGray) {
            let imgD = ctx.getImageData(0, 0, canvas.width, canvas.height)
            let len = canvas.width * canvas.height * 4
            for (let i = 0; i < len; i += 4) {
                let gray = Math.floor((imgD.data[i] + imgD.data[i + 1] + imgD.data[i + 2]) / 3)
                imgD.data[i] = imgD.data[i + 1] = imgD.data[i + 2] = gray > 100 ? gray : 0
            }

            ctx.putImageData(imgD, 0, 0)
        }

        return canvas.toDataURL(format)
    },

    post : (url, data, ps)=> ipcRenderer.invoke('post', url, data, ps),

    writeClipboard  : text=> ipcRenderer.invoke('common.toClipboard', text),
    readClipboard   : ()=> ipcRenderer.invoke('common.fromClipboard'),

    /**
     * 写入文件到机器人工作目录
     * @param {String} content
     * @param {String} filename
     * @param {Boolean} binary  默认 false，若为 true 则 content 应该传递 BASE64 编码的二进制数据
     * @returns
     */
    saveFile        : (content, filename, binary=false)=> ipcRenderer.send('saveToFile', content, filename, binary),

    readFile        : (path, encoding="utf-8")=> ipcRenderer.invoke('readFile', path, encoding),

    //=====================================================================================================
    /**
     * 测试主进程与渲染经常的通信
     */
    test(args) {
        ipcRenderer.send("test", args)
    }
})
