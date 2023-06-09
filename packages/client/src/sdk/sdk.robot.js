const logger = require("../common/logger")
const { progress, onData, onCSVData, onNotify, onCache, onLog } = require("../core/RobotManage")
const { getWindowId } = require("./tool")

module.exports = {
    /**
     * 任务进度
     * args 中有三个参数：
     *  progress == -1:任务失败了
     *  progress == 100：任务完成了
     */
    'progress': (e, p, info)=>{
        progress(getWindowId(e), p ,info)
    },
    'data': (e, data, saveToFs)=>{
        onData(getWindowId(e), data, saveToFs)
    },
    'cache': (e, key, data)=> onCache(getWindowId(e), key, data),

    'csv': (e, data, name, split)=>{
        onCSVData(getWindowId(e), data, name, split)
    },

    /**
     * 显示系统通知
     * @param {*} e
     * @param {*} title
     * @param {*} body
     */
    'notify': (e, title, body)=>{
        onNotify(getWindowId(e), title, body)
    },

    /**
     * 记录任务日志：
     * ① 在主日志记录
     * ② 在任务单独文件进行记录
     *
     * @param {*} _
     * @param {*} msg
     * @param {*} level
     */
    'log-robot':  (_, msg, level)=>{
        logger[level](msg)

        onLog(getWindowId(e), msg)
    },

    // 'download': (e, url, filename)=>{
    //     onDownload(getWindowId(e), url, filename)
    // }
}
