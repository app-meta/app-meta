const { ipcMain } = require("electron")
const { readdir } = require("fs")
const { basename, resolve } = require('path')

const logger = require("../common/logger")
const { loadScript } = require("../common/tool")
const U = require("../common/util")
const C = require("../Config")
const R = require("../Runtime")
const { sendEvent, withMainWindow } = require("../service/Global")
const { REMOTE, REMOTE_UPLOAD, getToken } = require("../service/Http")
const { createMainWindow, buildRemoteUrl } = require("../service/Helper")
const { notice } = require("../service/notice")

const STYLE = "background:magenta;color:white;padding:5px;"

/**
 * VITE 下按照下方代码动态导入
 * https://vitejs.cn/guide/features.html#glob-import
 */
// const modules = import.meta.globEager('./module/**/*.js')
// Object.keys(modules).forEach((key) => {
//     const mod = modules[key].default || {}
//     handleRegister(mod, basename(key).split(".")[0])
// })
// const modules = require.context('./module', true, /\.js$/);

/**
 * 目前只对主窗口开发 api 方式，无需校验调用方是否为主窗口
 * @param {*} e
 * @param {*} work
 */
let checkIdAndRun = (e, work)=>{
    if(e.sender &&
        (
            e.sender.id == R.mainWindowID
            ||
            (e.sender.browserWindowOptions && e.sender.browserWindowOptions.webPreferences.openerId==R.mainWindowID)
        )
    ){
        work()
    }else
        Tip.fail("此接口仅限于主窗口（不允许在任务窗口中调用）", "API 非法调用")
}

let handlers = {
    /**
     * 与远程服务端进行数据交互，统一使用 POST
     *
     * @param {*} suffix
     * @param {*} data
     * @param {*} ps   可设置 headers 等信息，通过定义 _FILE_ = true 可以上传文件
     * @returns
     */
    'remote-api': async (suffix, data, ps={})=> await (ps._FILE_===true? REMOTE_UPLOAD : REMOTE)(`${C.serverHost}${C.serverContext}${suffix}`, data, ps),

    //模拟发送事件
    'event' : (channel, ps)=> sendEvent(channel,ps),

    /**
     * 打开本地前端窗口
     * @param {String} url
     * @param {String} tokenName
     */
    'open-local-url': (url, tokenName="")=>{
        logger.debug(`打开本地地址（tokenName=${tokenName}） ${url}`)
        createMainWindow(
            url,
            true,
            tokenName?
                `localStorage.setItem("${tokenName}", "${getToken()}"); console.debug("%c请求头${tokenName}注入完成 ^.^", "${STYLE}");`
                :
                undefined
        )
    },

    /**
     * 下载客户端程序包
     * @param {String} url
     */
    'download-client': (url="/attach/client/meta-client.7z")=>{
        R.verbose && logger.info(`下载最新客户端 ${url}`)
        withMainWindow(/** @param {import("electron").WebContents} web */ web=>{
            web.downloadURL(buildRemoteUrl(url))
            web.session.once('will-download', (e, item)=>{
                item.once('done', (e, state)=> notice(state, `客户端程序包下载已${state=='completed'?"完成":"取消"}`))
            })
        })
    }
}

/**
 * 注册事件处理器
 * @param {*} items     Object 对象
 * @param {*} prefix    路由前缀，若有值则以 - 链接
 */
let handleRegister = (items, prefix="")=>{
    Object.keys(items).forEach(key=>{
        let uuid = `${prefix?(prefix+"."):""}${key}`
        logger.debug(`注册 <MAIN> 处理器 ${uuid}`)
        ipcMain.handle(uuid, (e, ...ps)=>{
            let senderId = e.sender.id
            if(R.isDev && uuid!='app.token') logger.debug(`[API] 事件 ${uuid}(SENDER=${senderId})`, ps)

            return items[key](...ps)
        })
    })
}

module.exports =async ()=>{
    handleRegister(handlers)

    /**
     * 不使用 webpack、vite 等构建工具时，手动加入各个模块
     */
    let moduleNames = ["app","robot","fs","common"]
    for(let name of moduleNames){
        handleRegister(require(`./module/${name}`), name)
    }

    //注册各模块 WEBPACK
    // modules.keys().forEach(key=>{
    //     const mod = modules(key).default || {}
    //     handleRegister(mod, basename(key).split(".")[0])
    // })

    // //注册各模块 VITE
    // Object.keys(modules).forEach((key) => {
    //     console.debug(key, modules[key], modules[key].default)
    //     const mod = modules[key].default || {}
    //     handleRegister(mod, basename(key).split(".")[0])
    // })
}
