/**
 * 数据操作工具
 *
 * 初始化：
 * H.data.init(aid, pid)
 */
// import { stringify }  from 'qs'
import { withPost, setContextPath } from "../common"
import { saveToFile } from "./io"

const KEY   = "app.launch"

let aid     = ""
let pid     = ""
let debug   = false
let prefix  = ""

const log = (msg, ...ps)=>console.debug(`%c[数据接口] ${msg}`, "background:#8c0776;padding:3px;color:white", ...ps)

/**
 * 以 POST 形式与后端进行交互
 * @param {*} model
 * @param {*} action
 * @returns Promise
 */
const send = (model, action="", json=true)=>{
    if(!aid) throw Error("DATA 模块尚未初始化，请先调用 init 方法")

    if(debug && action.startsWith("data/"))  log(`${action}`, model)
    return withPost(action, model, json)
    // return fetch(
    //     `${prefix}/${action}`,
    //     {
    //         method: "POST",
    //         headers:{"MUA": localStorage.getItem("MUA"), 'Content-Type': json?'application/json':'application/x-www-form-urlencoded'},
    //         body: model ? (json ? JSON.stringify(model) : stringify(model)):undefined
    //     }
    // ).then(handleResponse)
}

/**
 * 若 ps 未传递 aid 参数，则尝试从 url 中获取（通常是小程序的场景）
 * @param {*} _debug
 * @param {*} ps
 */
export const init = (ps={})=>{
    if(!!aid) throw Error("DATA 模块已经初始化，无需重复调用 init 方法...")
    debug = ps.debug === true
    let initFromUrl = false

    if(typeof(ps.aid) === 'string' && ps.aid && ps.aid.trim().length > 0){
        aid = ps.aid
        pid = ps.pid || ""
        prefix  = ps.prefix
    }
    // 尝试从 url 中读取相关信息
    else {
        let paths = location.pathname.split("/")
        let isLarge = paths.length >= 5
        prefix = isLarge?`/${paths[1]}/` : "/"
        let tmps = (isLarge? paths[3]: paths[2]).split("-")
        aid = tmps[0]
        pid = tmps[1]

        initFromUrl = true
    }

    if(!aid) throw Error(`参数 aid 不能为空`)

    if(!prefix && window.SERVER) prefix = window.SERVER
    setContextPath(prefix)

    debug &&  log(`环境初始化 AID=${aid} PID=${pid} PREFIX=${prefix}`)

    if(initFromUrl) {
        setTimeout(()=>{
            let launchTime =  H.store.getObj(KEY) //JSON.parse(localStorage.getItem("launch")||"{}")
            let time = Date.now()
            //60分钟内，仅计算一次
            if(!(aid in launchTime) || time - launchTime[aid] >= 60*60*1000){
                send({id: aid}, `app/launch`).then(()=> {
                    launchTime[aid] = time
                    H.store.setObj(KEY, launchTime)
                })
            }
        }, 6000)
    }
}

export const reset = ()=>{
    aid = ""
    pid = ""
    if(debug)   log(`DATA 模块已重置...`)
    debug = false
}

export const info = ()=> log(`AID=${aid} PID=${pid}`)

export const getPrefix = ()=> prefix
export const getAppId = ()=> aid
export const getPageId = ()=> pid
export const isDebug = ()=> debug
export const setDebug = _debug => debug = _debug === true

/**
 * 获取当前登录用户的信息
 *
 * 示例：
 * H.data.getUserInfo().then(user=>{})
 * @returns 用户信息
 */
export const getUserInfo = async ()=>{
    let user = await send(null, `whoami`)
    return user.data
}

/**
 *
 * @param {*} rows
 * @param {*} _pid
 * @param {*} ps
 */
export const insert = (rows, _pid="", ps={})=>{
    let model = { aid , pid: _pid||pid }
    let isBatch = Array.isArray(rows)
    model[isBatch?"objs":"obj"] = rows
    if(isBatch && "batch" in ps)   model.batch = ps.batch
    if("origin" in ps)  model.origin= ps.origin

    //如果填写了 batch 属性，则必须填写 pid
    if(!!model.batch && !model.pid) throw Error(`按批次导入数据请指明 pid ，使用 insert(rows, pid, ps) 的参数二传递该值`)

    return send(model, "data/create")
}

/**
 * 更新数据（按确定的 id）
 * @param {*} id
 * @param {*} newVal
 */
export const  update = (id, newVal)=>{
    let model = { aid }
    model.obj = newVal
    model.id = id

    return  send(model, "data/update")
}

const _buildMatchModel = modelOrId=>{
    let model = { aid }
    if(typeof(modelOrId) !== 'object')
        model.id = modelOrId
    else{
        ["pid", "uid", "timeFrom", "timeEnd"].forEach(k=> { if(k in modelOrId) model[k] = modelOrId[k] })
        if(!!pid)   model['pid'] = pid

        modelOrId.match && (model.match = Array.isArray(modelOrId.match)? modelOrId.match : [modelOrId.match])
    }
    return model
}

/**
 * match    筛选数组 {field, op, value}
 * pid      页面/分组id
 * uid      筛选特定用户的数据
 * id       按照数据id进行查询（场景较少）
 * page     分页
 * pageSize 每页多少条数据
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
export const query = (modelOrId={})=>{
    // let model = { aid }
    // if(typeof(modelOrId) !== 'object')
    //     model.id = modelOrId
    // else{
    //     ["pid", "uid", "page", "pageSize", "timeFrom", "timeEnd"].forEach(k=> { if(k in modelOrId) model[k] = modelOrId[k] })
    //     if(!!pid)   model['pid'] = pid

    //     modelOrId.match && (model.match = Array.isArray(modelOrId.match)? modelOrId.match : [modelOrId.match])
    // }
    // 复用 _buildMatchModel 方法
    let model = _buildMatchModel(modelOrId)
    // 对于查询，还可以定义更多的限定（如分页）
    if(typeof(modelOrId) == 'object')
        ["page", "pageSize", "desc"].forEach(k=> { if(k in modelOrId) model[k] = modelOrId[k] })

    return send(model, "data/query")
}

/**
 * 参数同 query
 * @param {*} modelOrId
 */
export const remove = (modelOrId)=> send(_buildMatchModel(modelOrId), "data/delete")

/**
 * 导出数据到文件（后端实现）
 * @param {*} modelOrId
 * @param {*} headers
 * @param {*} filename
 * @param {*} format
 */
const _exportData = (modelOrId, headers, filename="", format="xlsx")=> new Promise((ok, reject)=>{
    if(!headers || !headers.length)         return reject(`参数 headers （数据标题列） 必须填写`)
    let model = _buildMatchModel(modelOrId)

    model.headers = typeof(headers[0]) === 'string'? headers.map(field=>({field, text:field})): headers
    model.format = format
    model.filename = filename

    // fetch(
    //     `${prefix}/data/export`,
    //     {
    //         method: "POST",
    //         headers:{"MUA": localStorage.getItem("MUA"), 'Content-Type': 'application/json'},
    //         body: JSON.stringify(model)
    //     }
    // )
    // .then(async res=>{
    //     if(res.headers.get("content-type") == 'application/json'){
    //         let json = await res.json()
    //         throw Error(json.message)
    //     }

    //     return res.blob()
    // })
    // .then(b=>{
    //     saveToFile(b, filename)
    //     ok()
    // })
    // .catch(e=> reject(e.message))

    withPost(
        `/data/export`, model, true,
        async res=>{
            if(res.headers.get("content-type") == 'application/json'){
                let json = await res.json()
                throw Error(json.message)
            }

            return res.blob()
        }
    )
    .then(b=>{
        saveToFile(b, filename)
        ok()
    })
    .catch(e=> reject(e.message))

})

export const exportToExcel = (modelOrId={}, headers=[], filename)=> _exportData(modelOrId, headers, filename)

export const exportToCSV = (modelOrId={}, headers=[], filename)=> _exportData(modelOrId, headers, filename, "csv")

/**
 * 读取数据块，返回的内容是 text，需要自行转换为目标格式
 * @param {*} uuid
 */
export const getBlock = uuid=> send({aid, uuid }, "data/block/get")

/**
 * 赋值（覆盖）数据块
 * @param {*} uuid 唯一ID
 * @param {String|Object} text 数据内容，为空则视为删除该数据块
 */
export const setBlock = (uuid, text) =>send({aid, uuid, text: typeof(text)=='string'? text: JSON.stringify(text) }, "data/block/set")

/**
 * 返回全部的数据块
 * 量可能较大，慎用
 */
export const listBlock = ()=> send({aid}, "data/block/list")

/**
 * 返回应用详细信息，包含两个属性
 *  app         应用基本信息
 *  property    应用其他属性（如窗口大小等）
 */
export const getAppDetail = ()=> send({ id: aid}, "app/detail")

/**
 * 获取应用下的页面清单（仅限开启访问）
 */
export const listPage = ()=> send({form:{EQ_aid:aid, EQ_active:true}}, "page/list")

/**
 * 获取指定页面的附件清单
 * @param {*} id    不指定则为预设的 pid
 */
export const listAttach = (id=pid)=> send({id}, "page/document-list")

// const buildServiceUrl = (path, specialAid)=> `service/${specialAid || aid}/${path.startsWith("/")?path.substr(1):path}`

// /**
//  * 调用后端服务（必须返回 JSON 格式的对象或者字符串）
//  *
//  * @param {*} path              服务地址
//  * @param {*} data              Object 类型的参数
//  * @param {*} useJson           是否使用 JSON 格式提交（默认 true）
//  * @param {*} specialAid        在某些情况下，需要调用跨应用的服务，传递此参数将覆盖默认的 aid
//  * @param {*} responseHandler   fetch 方法的响应处理，默认是转换为 JSON 格式
//  *                              如果后端返回文件流，则可以参考 _exportData 进行 blob 处理
//  */
// export const service = (path, data, useJson=true, specialAid, responseHandler)=> withPost(buildServiceUrl(path, specialAid), data, useJson, prefix, responseHandler)

// /**
//  * 处理纯文本的远程返回内容
//  * withPost(buildServiceUrl(path, specialAid), data, useJson, prefix, response=> response.text())
//  * @param {*} path
//  * @param {*} data
//  * @param {*} useJson
//  * @param {*} specialAid
//  */
// export const serviceForText = (path, data, useJson=true, specialAid) => service(path, data, useJson, specialAid, res=>res.text())
