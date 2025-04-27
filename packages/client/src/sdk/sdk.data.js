const { getRobotInfo } = require("../core/RobotManage")
const { callServer, withPost } = require("../service/Http")
const { getWindowId } = require("./tool")

const { verbose } = require("../Runtime")
const logger = require("../common/logger")

/**
 * 详见 packages\library\module\data.js
 *
 * @typedef {Object} MatchItem
 * @property {String} field - 字段名称
 * @property {String} op - 查询类型（详见下方说明）
 * @property {*} value
 *
 * @typedef {Object} DataOption
 * @property {String} aid - 应用ID
 * @property {Number|String} pid - 页面ID
 * @property {String} id - 对象ID，通常是数据行ID
 * @property {String} uid - 限定用户ID
 * @property {Number} page - 👉查询用👈 分页
 * @property {Number} pageSize - 👉查询用👈 每页显示的数据量
 * @property {Array<MatchItem>} match - 👉查询用👈 筛选数组
 * @property {String} timeFrom - 👉查询用👈 筛选开始时间
 * @property {String} timeEnd - 👉查询用👈 筛选结束时间
 *
 * 筛选条件中的 op 可选值：
 *  const operations = [
        { label:"等于", value:"EQ" },
        { label:"包含", value:"LIKE" },
        { label:"小于", value:"LT" },
        { label:"不大于", value:"LTE" },
        { label:"大于", value:"GT" },
        { label:"不小于", value:"GTE" },
        { label:"不等于", value:"NE" },
        { label:"在", value:"IN" },
        { label:"不在", value:"NIN" }
    ]
 */

// const _buildMatchModel = (modelOrId, pid)=>{
//     let model = { }
//     if(typeof(modelOrId) !== 'object')
//         model.id = modelOrId
//     else{
//         ["pid", "uid", "timeFrom", "timeEnd"].forEach(k=> { if(k in modelOrId) model[k] = modelOrId[k] })
//         if(!!pid)   model['pid'] = pid

//         modelOrId.match && (model.match = Array.isArray(modelOrId.match)? modelOrId.match : [modelOrId.match])
//     }
//     return model
// }
/**
 *
 * @param {String|DataOption} opt
 * @returns {DataOption}
 */
const _buildMatchModel = opt =>{
    let m = typeof(opt)=='string'? { aid: opt } : { aid: opt.aid }

    if(!!opt.id){
        m.id = opt.id
    }
    else{
        if(opt.pid)         m.pid = opt.pid
        if(opt.uid)         m.uid = opt.uid
        if(opt.timeFrom)    m.timeFrom = opt.timeFrom
        if(opt.timeEnd)     m.timeEnd = opt.timeEnd

        opt.match && (m.match = Array.isArray(opt.match)? opt.match : [opt.match])
    }

    return m
}

const buildServiceUrl = (path, aid)=> `/service/${aid}/${path.startsWith("/")?path.substr(1):path}`

const RESULT = async (action, body)=> {
    let { data } = await callServer(action, body)
    return data
}

/**
 *
 * @param {IpcRendererEvent} e
 * @param {Function} handler
 * @returns
 */
const withRobot = (e, handler)=>{
    let winId = getWindowId(e)
    verbose && logger.info(`获取机器人窗口[PID=${e.processId} FID=${e.frameId} WEB=${e.sender.id}]的编号=${winId}`)

    let { aid, pid } = getRobotInfo(winId)
    verbose && logger.info(`获取机器人窗口#${winId}的任务信息 aid=${aid} pid=${pid}`)

    if(!aid)    throw Error(`当前网页机器人未关联任何应用（aid 未配置），无法使用该功能`)
    return handler(aid, pid, winId)
}

/**
 * 对后端数据接口的调用
 *
 * 以 packages\library\module\data.js 为准，只选择常用的接口
 */
module.exports = {
    /**
     * 插入数据，不支持批次功能
     *
     * @typedef {Object} InsertOption - 插入选项
     * @property {Number} pid - 指定 pid
     * @property {String} batch - 批次号
     * @property {String} origin - 源头
     *
     * @param {IpcRendererEvent} e
     * @param {Array|Object} rows
     * @param {InsertOption} option
     * @returns
     */
    'data.insert': (e, rows, option)=>withRobot(e, (aid, pid)=>{
        let model = { aid , pid: option.pid || pid }
        let isBatch = Array.isArray(rows)
        model[isBatch?"objs":"obj"] = rows
        if(option.batch)
            model.batch = option.batch
        if(option.origin)
            model.origin = option.origin

        return RESULT("/data/create", model)
    }),

    /**
     * 使用方法详见 packages\library\module\data.js#query
     * @param {*} e
     * @param {*} modelOrId
     * @returns
     */
    'data.query': (e,modelOrId)=> withRobot(e, (aid, pid)=>{
        let model = _buildMatchModel(modelOrId, pid)
        if(!model.aid)
            model.aid = aid

        // 对于查询，还可以定义更多的限定（如分页）
        if(typeof(opt) == 'object')
            ["page", "pageSize", "desc"].forEach(k=> { if(k in opt) model[k] = opt[k] })

        return RESULT("/data/query", model)
    }),

    /**
     * 更新指定数据对象（限定 ID）
     * @param {*} e
     * @param {Number} id
     * @param {Object} obj
     * @returns
     */
    'data.update': (e, id, obj)=> withRobot(e, aid=> RESULT("/data/update", { aid, id, obj })),

    'data.getBlock': (e,uuid)=> withRobot(e, (aid)=> RESULT("/data/block/get", {aid, uuid})),

    /**
     *
     * @param {IpcRendererEvent} e
     * @param {String} uuid
     * @param {String|Object} text
     * @returns
     */
    'data.setBlock': (e, uuid, text)=> {
        verbose && logger.info(`[RPA] WEBCONTENT#${e.sender.id} 调用 data.setBlock 方法`, uuid, text)
        withRobot(e, (aid, pid, windowId)=> {
            verbose && logger.info(`[RPA] 获取到任务信息 aid=${aid}，即将发送数据到远程服务器...`)
            RESULT("/data/block/set", {aid, uuid, text: typeof(text)==='string'? text: JSON.stringify(text)})
        })
    },

    /**
     * 暂不支持非 JSON 参数的提交
     * @param {*} e
     * @param {*} path
     * @param {*} data
     * @param {*} useJson
     * @param {*} specialAid
     * @returns
     */
    'data.service': (e, path, data, useJson=true, specialAid)=> withRobot(e, (aid)=>{
        return RESULT(buildServiceUrl(path, specialAid||aid), data)
    }),

    /**
     * 发送数据到指定的地址
     * @param {*} e
     * @param {*} url
     * @param {*} data
     * @param {*} ps
     * @returns
     */
    'post': (e, url, data, ps={})=> withRobot(e, (aid, pid)=> withPost(url, data, ps))
}
