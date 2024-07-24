const { BrowserWindow, screen } = require("electron")

/**
 * 通知窗口参数
 * @typedef {Object}    Option
 * @property {BrowserWindow} parent
 * @property {String}   title
 * @property {String}   content
 * @property {Number}   width
 * @property {Number}   height
 */

/**
 * 全局配置
 * @typedef {Object}    NoticeConfig
 * @property {Number}   width - 通知窗口默认宽度
 * @property {Number}   height - 通知窗口默认高度
 * @property {Number}   gutter - 边距
 */

/**
 * @type NoticeConfig
 */
const config = {
    width   : 420,
    height  : 160,
    gutter  : 10
}

/**
 * 更新全局配置项，合并模式
 * @param {NoticeConfig} newConfig
 */
exports.updateConfig = newConfig=>{
    Object.assign(config, newConfig)
    console.debug(`Global Config updated:`, config)
}

/**
 * 创建一个新的通知窗口
 * @param {Option} opt
 */
exports.create = opt=>{

}
