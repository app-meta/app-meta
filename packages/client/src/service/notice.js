/*
 * @Author: 集成显卡
 * @Date: 2022-02-08 10:52:17
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-05-05 17:34:29
 */

const { release } = require("os")
const { dialog } = require('electron')

const C = require("../Config")
const R = require("../Runtime")
const { notify } = require('node-notifier')
const { iconPath } = require('../core/App')
const logger = require('../common/logger')

const logoIcon = iconPath("logo")

let icons = {

}

const ok = (message, title="操作成功", detail="欢迎使用 "+C.displayName)=>{
    dialog.showMessageBox({title, message, detail, icon:icons.ok})
}

const fail = (message, title="操作失败", detail="欢迎使用 "+C.displayName)=>{
    dialog.showMessageBox({title, message, detail, icon:icons.fail})
}

const info = (message, title="提示", detail="欢迎使用 "+C.displayName)=>{
    dialog.showMessageBox({title, message, detail, icon:icons.about})
}

const bug = (message, title="BUG 出现啦", detail="欢迎使用 "+C.displayName)=>{
    dialog.showMessageBox({title, message, detail, icon:icons.fail})
}

const getAppIdForNotice = ()=> release().indexOf("10.0.1")==0? "":C.displayName

module.exports ={
    /**
     * 发起系统通知，详见：https://www.electronjs.org/docs/latest/api/notification
     *
     * @param {*} title 通知标题，如果是 Object 对象，则视为 Notification 的参数
     * @param {*} body
     * @param {*} icon  图标（默认为 logo.png）
     * @returns
     */
    notice (title, body, icon=logoIcon){
        // electron 自带的通知在 windows 10 下不好用
        // return new Promise((ok,fail)=>{
        //     if(!Notification.isSupported()) fail("当前系统不支持通知")

        //     let ps = typeof(title) == 'object'? title : {title, body}
        //     let n = new Notification(ps)
        //     n.on('click', ok)
        //     n.show()
        // })
        return new Promise((ok, fail)=>{
            notify(
                { appID: getAppIdForNotice(), title, message: body, icon, sound: true, wait: true, time: 30*1000 },
                // Response is response from notification
                // Metadata contains activationType, activationAt, deliveredAt
                (err, response, metadata)=>ok()
            )
        })
    },
    ok,
    fail,
    info,
    bug
}
