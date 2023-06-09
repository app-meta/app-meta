/*
 * @Author: 0604hx/集成显卡
 * @Date: 2022-12-27 18:10:48
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-02-16 10:37:55
 *
 * 针对动态数据提供 CURD 快速调用的方法
 *
 * 2023-01-05   增加 block 相关方法；增加 _pid 参数（可以指定数据类别）
 */

let aid = ""    //应用id
let pid = ""    //表单id（通常为空）

const QUERY_FIELDS = ["match", "pid", "uid", "page", "pageSize", "timeFrom", "timeEnd"]

const log = (msg, ...ps)=> console.info(`%c[数据接口] ${msg}`, "background:#8c0776;padding:3px;color:white", ...ps)

function buildModel(action="R", _pid){
    if(!aid)    throw Error(`请先通过 INIT 方法初始化 Data 环境`)
    return { aid, pid:_pid||pid, action }
}

const _do = (suffix, body)=> new Promise((ok, fail)=> RESULT(`/data/${suffix}`, body, d=> ok(d.data), {fail}) )

/**
 * 如果为数值则转换为 Number
 *
 * 此处暂不考虑 true/false 的布尔型
 *
 * 方案一：仅仅对数字进行处理
 * const _fix = v=> isNaN(v)?v:Number(v)
 *
 * 方案二：默认按照字符串对待，如果输入的是 @TRUE 或者 @FALSE 则转换为布尔型；如果是 @{数值} 则转换为数字
 *
 * @param {*} v
 * @returns
 */
const _fix = v=>{
    if(v==='@TRUE')         return true
    else if(v==='@FALSE')   return false
    else if(v.indexOf("@")==0 && !isNaN(v.substring(1)))
        return Number(v.substring(1))
    return v
}

/**
 * 字段筛选方式
 */
export const operations = [
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

export function INIT(_aid, _pid=""){
    aid = _aid
    pid = _pid
    log(`初始化 Data|DataBlock 环境（AID=${aid}${pid?(" | PID="+pid):""}）`)
}

/**
 * 新增数据列
 * @param {*} rows  如果是数组则进行批量插入（batch=true）
 */
export function INSERT(rows, _pid){
    let model = buildModel("C", _pid)
    let isBatch = Array.isArray(rows)
    model.batch = isBatch
    model[isBatch?"objs":"obj"] = rows

    return _do("create", model)
}

/**
 * 数据查询
 * @param {*} matchOrId ID或者筛选条件（若为 Object 则视为筛选条件），ID 查询则返回唯一数据
 * @param {*} page      分页，默认为0（不进行分页）
 * @param {*} pageSize  每页数据量，默认为 200
 * @returns
 */
export function QUERY_BY_MATCH(matchOrId, _pid="", page=0, pageSize=200){
    let model = buildModel("R", _pid)
    let isId  = typeof(matchOrId)!=='object'

    if(!isId){
        model.page = page
        model.pageSize  = pageSize

        if('_UID_' in matchOrId){
            if(!!matchOrId._UID_) model.uid = matchOrId._UID_

            delete matchOrId._UID_
        }
    }
    model[isId?'id':'match'] = [{field:"ip", op:"EQ", value:"103.205.6.250"}] //matchOrId
    return _do("query", model)
}

/**
 * 构建过滤器（会对数据类型进行自我修正）
 * 1、纯数字的文本将转换为 Int 或者 Float
 * 2、对于 op = IN 或者 NIN 会将 value 转换为 List 类型
 * @param {*} filters
 */
export function buildQueryFilter(filters){
    if(!Array.isArray(filters)) throw Error(`参数 filters 必须为数组`)

    let match = []
    for(let i = 0; i<filters.length; i++){
        let filter = filters[i]
        if(!filter.field)   throw Error(`条件 ${i+1} 的字段不能为空`)

        let v = ""
        if(filter.op == "IN" || filter.op == "NIN"){
            if(!!filter.value){
                try{
                    v = JSON.parse(filter.value[0] != '['?`[${filter.value}]`:filter.value).map(_fix)
                }catch(e){
                    throw Error(`条件 ${i+1} 的筛选值格式有误（在/不在 条件时请填写 JSON 数组）`)
                }
            }
        }
        else {
            v = _fix(filter.value)
        }

        match.push({field: filter.field, op: filter.op, value: v})
    }

    return match
}

/**
 *
 * @param {*} modelOrId
 */
export function QUERY(modelOrId, _pid) {
    let model = buildModel("R", _pid)
    if(typeof(modelOrId) !== 'object')
        model.id = modelOrId
    else
        QUERY_FIELDS.forEach(k=>{ if(k in modelOrId) model[k] = modelOrId[k] })

    return _do("query", model)
}

export function UPDATE(id, newVal){
    let model = buildModel("U")
    model.obj = newVal
    model.id = id

    return _do("update", model)
}

/**
 *
 * @param {*} matchOrId
 * @returns
 */
export function DELETE(matchOrId, _pid){
    let model = buildModel("D", _pid)
    if(typeof(modelOrId) !== 'object')
        model.id = modelOrId
    else
        QUERY_FIELDS.forEach(k=>{ if(k in modelOrId) model[k] = modelOrId[k] })

    return _do("delete", model)
}

/**
 * 读取数据块，返回的内容是 text，需要自行转换为目标格式
 * @param {*} uuid
 * @returns
 */
export const GET_BLOCK = uuid=> _do("block/get", {aid, uuid})

/**
 * 更新数据块
 * @param {*} uuid  唯一ID
 * @param {*} text  数据内容，为空则视为删除该数据块
 * @returns
 */
export const SET_BLOBK = (uuid, text) => _do("block/set", {aid, uuid, text})
