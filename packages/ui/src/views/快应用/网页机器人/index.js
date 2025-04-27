/**
 * windowWidth      窗口高度，单位 px
 * windowsHeight    窗口宽度，单位 px
 * snapshot         是否在任务结束时截图，默认 true
 * merge            是否将数据保存到同一目录下，默认 true
 * timeout          执行超时，单位 秒，默认 180
 * headers          额外的 header，用换行符 \n 进行分割
 * delay            延时执行脚本，单位 秒，默认 2
 * url              网站首页
 * code             机器人脚本代码
 */
export const createRobot = ({
    windowWidth     : 1280,
    windowHeight    : 720,
    snapshot        : false,
    merge           : true,
    timeout         : 180,
    headers         : "",
    delay           : 2,
    url             : "",
    code            : "",
    devtool         : 0,
})

/**
 * 对于开发环境，返回的是3000端口的资源路径
 * @returns {Array<Object>}
 */
export const getDebugers = ()=>{
    let { isDev } = Config
    return [
        { name:"vConsole", label:"vConsole（腾讯）", code:"new window.VConsole()", url: isDev?"http://localhost:3000/static/tools/vConsole.js":"" },
        { name:"eruda", label:"Eruda", code:"eruda.init()", url: isDev?"http://localhost:3000/static/tools/eruda.js":"" }
    ]
}

/**
 *
 * @param {String} url
 * @param {Object} debuger
 * @returns
 */
export const debugForUrl = (url, debuger) =>{
    if(!url || !url.startsWith("http"))
        return M.warn(`请先填写正确的URL`)

    console.debug(`即将启动页面调试 ${url}（DEBUGER=${debuger.name}）`)
    META.runRobotWithDebug(url, debuger)
}
