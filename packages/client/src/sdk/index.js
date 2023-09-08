/*
 * @Author: 集成显卡
 * @Date: 2022-03-14 09:00:22
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-09-08 09:54:06
 *
 *
 */
const { writeFile } = require('fs')
const { BrowserWindow, clipboard } = require('electron')
const logger = require('../common/logger')

const { notice } = require("../service/notice")
const U  = require("../common/util")

const MainSDK = require("./sdk.main")
const { RobotHandlers, RobotInvokeHandlers } = require("./sdk.robot")
const DataSDK = require("./sdk.data")

const { getWindowId, register, webContent, registerInvoke } = require('./tool')

let listeners = {
    "flash": (e)=>{
        //获取当前窗口
        let currentWindow = BrowserWindow.fromWebContents(e.sender)
        if(currentWindow){
            currentWindow.once('focus', () => currentWindow.flashFrame(false))
            currentWindow.flashFrame(true)
        }
    },

    "set-title": (e, title)=>{
        BrowserWindow.fromWebContents(e.sender).setTitle(title)
    },

    "export-pdf": (e, name, header=true) => {
        let uuid = T.getScriptIDByWindowId(getWindowId(e))
        let {web, title, url} = webContent(e)

        const filename = U.getAttachPath( uuid, `${name||title}.pdf`)

        let ps = { printBackground: true, landscape:true}
        if(header)  ps.headerFooter = {title, url}
        web.printToPDF(ps)
            .then(data=>{
                writeFile(filename, data, (error) => {
                    if (error) throw error
                    logger.info(`(${uuid?uuid:"主进程"}) 写入 PDF 成功:`, filename)
                    web.send("notice", `保存到 ${filename}`, `PDF 已生成`, 'ok')
                })
            })
            .catch(ee=>{
                logger.error(`另存为PDF失败`, ee)
                web.send("notice", `另存为PDF失败：${ee.message}`, 'error')
            })
    },
    /**
     * 保存到 html
     *
     * args 包含内容：
     *  filename: 保存文件名，默认为页面标题
     *  content:  html 内容
     *  type: electron 自带导出 HTML 的类型格式， 有 HTMLOnly， HTMLComplete，MHTML
     */
    "export-html": (e, args) => {
        args = args || {}
        logger.info("导出到 HTML, task ID=", Task.getId())

        let {web, title} = webContent(e)
        const filename = U.getAttachPath(getWindowId(e), `${args.filename || title}.html`)

        if (args.content) {
            fs.writeFile(filename, args.content, (error) => {
                if (error) throw error
                logger.info('Write HTML successfully:', filename)
            })
        }
        //如果没有传递 content，则默认把整个网页内容都保存出来
        else {
            web.savePage(filename, args.type || 'HTMLOnly')
                .then(()=> logger.info(`save html success: ${filename}`))
                .catch(ee=>logger.error(`save html file fail`, ee))
        }
    },

    "notification": (e, msg, title)=>{
        console.debug(`[notification] 显示通知：${msg}`)
        notice(title, msg)
    },

    'log': (e, msg, level)=>{
        logger[level](msg)
    },

    "test": (e, args, win)=>{
        console.log("接收到测试事件：", e.sender.id, e.sender.isMain, e.sender.flashFrame)
        console.log("参数：", args)
        console.log("当前窗口", e.target, win)
    }
}

let invokeListeners = {
}

module.exports = (mainWindow)=>{
    register(listeners, "COMMON")
    register(RobotHandlers, "ROBOT")
    registerInvoke(RobotInvokeHandlers, "ROBOT")
    registerInvoke(DataSDK, "DATA")

    MainSDK()
}
