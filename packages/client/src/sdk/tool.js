const { BrowserWindow, ipcMain } = require("electron")

const logger = require("../common/logger")
const { verbose } = require("../Runtime")

/**
 * 通过事件获取对应的 windowID
 *
 * 注意 e.sender.id 不是窗口ID
 * @param {*} e
 * @returns
 */
exports.getWindowId = function(e){
    return BrowserWindow.fromWebContents(e.sender).id
}

exports.getWindow = function(e){
    return BrowserWindow.fromWebContents(e.sender)
}

/**
 * 获取 WebContent 对象、页面标题、页面URL
 * @param {*} e
 * @returns
 */
exports.webContent = function(e){
    let web = e.sender
    let title = web.getTitle()
    let url = web.getURL()

    return { web, title, url }
}

/**
 *
 * @param {*} items
 * @param {*} group
 */
exports.register = function(items, group){
    for(let k in items){
        ipcMain.on(k, items[k])
        logger.debug(`注册 <${group}> 监听器 ${k}`)
    }
}

/**
 * 以 handle 方式注册处理器
 * @param {*} items
 * @param {*} group
 */
exports.registerInvoke = (items, group)=> {
    for(let k in items){
        ipcMain.handle(k, async (...args)=>{
            try{
                return Promise.resolve(items[k](...args))
            }catch(e){
                logger.error(`调用 ${group}/${k} 处理器出错`, e)
                throw e
            }
        })
        verbose && logger.info(`注册 <${group}> 处理器 ${k}`)
    }
}
