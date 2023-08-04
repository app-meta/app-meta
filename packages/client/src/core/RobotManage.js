const { versions } = require("process")
const C = require("../Config")
const R = require("../Runtime")
const logger = require("../common/logger")
const { notice } = require("../service/notice")
const { iconPath } = require("./App")
const ScriptRobot = require("./Robot")
const { callServer } = require("../service/Http")
const { broadcastAll } = require("../service/Global")

const PAGE = "page"

const workers = []            //当前执行任务的列表

// 获取特定的任务执行对象，若无匹配则返回 undefined
const getWorker = windowId=>workers.find(w=>w.getWindowId()==windowId)

const getWorkerByUUID = uuid=>workers.find(w=>w.uuid == uuid)

const filterWithWindowId    = (w, id)=>w.getWindowId()==id
const filterWithUUID        = (w, id)=>w.uuid == id

const withWorker = (windowIdOrUuid, todo)=> {
    let filter = isNaN(windowIdOrUuid)? filterWithUUID: filterWithWindowId
    let worker = workers.find(w=>filter(w, windowIdOrUuid))
    if(!worker){
        if(R.isDev) logger.debug(`找不到 ID=${windowIdOrUuid} 的 Robot，跳过...`)
        return
    }

    todo(worker)
}

const onNotify = (windowId, title, body) => withWorker(windowId, worker=>{
    notice(title??worker.getName(), body, iconPath("robot"))
})

module.exports = {
    repairAndCheck (item){
        if(!(PAGE in item) && "url" in item){
            item = { page:{aid:"", pid:""}, bean: item, params:{}}
        }
        let { bean } = item
        let errors = []
        if(!bean.url)   errors.push(`首页 url 不能为空`)
        bean.delay ??= C.rpa.delay
        bean.timeout ??= C.rpa.timeout

        if(errors.length)   throw Error(`机器人格式有误：${errors.join("；")}`)

        return item
    },

    runRobot (item){
        const robot = new ScriptRobot(item)
        robot.start()

        setTimeout(()=>{
            if(robot.startOn > 0){
                workers.push(robot)
                logger.debug(`Robot#${robot.getUUID()} 加入队列...`)
                // 统计执行次数
                callServer("/app/launch", {aid: robot.aid, pid:robot.pid}).catch(e=> logger.error(`调用 /app/launch 接口失败`, e))

                /*
                广播机器人运行的事件，参数一为机器人基本信息{id，aid，name}，参数二为启动参数
                 */
                broadcastAll('robot.start', item.page, item.params)

                robot.onClosed = ({ uuid, aid, pid, bean, startOn, params, logs })=>{
                    let index = workers.findIndex(w=>w.uuid == uuid)
                    if(index>=0){
                        workers.splice(index, 1)
                        logger.debug(`Robot#${uuid} 从队列中移除...`)

                        //上传机器人运行信息
                        let d = {
                            aid,
                            pid,
                            startOn,
                            used        : ~~((Date.now() - startOn)/1000),
                            chrome      : process.versions.chrome,
                            os          : `${process.platform} ${process.getSystemVersion()}`,
                            "params"    : JSON.stringify(params),
                            origin      : JSON.stringify(bean),
                            logs        : JSON.stringify(logs)
                        }

                        callServer("/page/robot/save", d)
                            .then(v=> logger.debug(`保存 ROBOT 运行信息（返回ID=${v.data}`))
                            .catch(e=> logger.error(`保存 ROBOT 运行信息出错`, e))

                        //广播事件
                        broadcastAll('robot.done', pid, d)
                    }
                }
            }
        }, 1000)
    },

    /**
     * @param {*} windowId
     * @param {*} p     进度，-1=失败，大于100则成功
     * @param {*} msg   描述信息
     */
    progress: (windowId, p, msg)=> withWorker(windowId, worker=>{
        logger.debug(`[PROGRESS] windowID=${windowId} Robot=${worker.getUUID()} progress=${p}  message=${msg}`)
        worker.updateProgress(p, msg)
    }),

    /**
     *
     * @param {*} windowId
     * @param {*} data      数据对象
     */
    onData : (windowId, data)=> withWorker(windowId, worker=>{
        let uuid    = worker.getUUID()
        logger.debug(`${uuid} 请求保存数据: ${data}`)
    }),

    onCache : (windowId, key, data)=> withWorker(windowId, worker=> worker.onCache(key, data)),

    /**
     *
     * @param {*} windowId
     * @param {*} data  数据对象，支持 Object（按 Object.values 取值）、Array（推荐使用）
     * @param {*} name
     * @param {*} split
     */
    onCSVData (windowId, data, name="default", split=",") {
        let worker = getWorker(windowId)
        if(!worker) return

        //构建 CSV 行数据
        let line = (Array.isArray(data)? data: Object.values(data))
                    .map(d=>{
                        //数组处理
                        if(Array.isArray(d))            return `"${d.join(RN).replace(/"/g,"`")}"`
                        //字符串处理：双引号替换成 `
                        else if(typeof(d) === 'string') return `"${d.replace(/"/g,"`")}"`
                        return d
                    })
                    .join(split) + RN

        worker.onTextData(line, `${name}.csv`)
    },

    onNotify,

    onLog :(windowId, msg, level="INFO")=> withWorker(windowId, worker=> worker.log(`${level} ${msg}`)),

    getRobotInfo : windowId=> {
        let detail = {}
        withWorker(windowId, worker=> {
            detail = worker.summary()
        })
        return detail
    }
}
