const { readFileSync } = require("fs")
const { verbose } = require("../Runtime")
const logger = require("../common/logger")
const { isAbsoluteWindowsPath, exist, needFile } = require("../common/util")
const { progress, onData, onCSVData, onNotify, onCache, onLog, onDownload, onSaveToFile } = require("../core/RobotManage")
const { getWindowId } = require("./tool")

exports.RobotHandlers = {
    /**
     * 任务进度
     * args 中有三个参数：
     *  progress == -1:任务失败了
     *  progress == 100：任务完成了
     */
    'progress': (e, p, info)=>{
        let winId = getWindowId(e)
        progress(winId, p ,info)

        if(p<0) onNotify(winId, null, `[异常]${info}`)
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
     * @param {*} e
     * @param {*} msg
     * @param {*} level
     */
    'log-robot':  (e, msg, level)=>{
        logger[level](msg)

        onLog(getWindowId(e), msg)
    },

    'download': (e, url, filename)=>{
        onDownload(getWindowId(e), url, filename)
    },

    'saveToFile' : (e, content, filename, binary)=> onSaveToFile(getWindowId(e), content, filename, binary)
}

exports.RobotInvokeHandlers = {
    /**
     *
     * @param {Electron.IpcMainInvokeEvent} e
     * @param {String} path
     * @param {String} encoding
     */
    'readFile': (e, path, encoding)=>{
        path = path.replace(/\\/g, "/")
        if(!isAbsoluteWindowsPath(path)){
            if(path.startsWith("$APP/"))
                path = path.replace(/^\$APP/, dataPath)
            //从RPA机器人中获取数据目录
            else if(path.startsWith("$ROBOT/")){
                let { aid, pid } = getRobotInfo(getWindowId(e))
                if(!aid)    throw `未找到关联机器人的AID`

                path = path.replace(/^\$ROBOT/, dataDir(`${aid}-${pid}`))
            }
        }
        verbose && logger.info(`按[ENCODING=${encoding}]读取文件 ${path}`)

        needFile(path)
        return readFileSync(path, {encoding})
    }
}
