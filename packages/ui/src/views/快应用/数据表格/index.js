/**
 * @typedef {Object} ColumnBean
 * @property {String} key
 * @property {String} label
 * @property {Boolean} center
 * @property {Number} width
 * @property {String} render
 *
 * @typedef {Object} ButtonBean
 * @property {String} label
 * @property {String} category
 * @property {String} icon - 图标，仅支持 fa 样式
 * @property {String} type - 类型，info、primary、warning、error、success
 * @property {String} handler - 处理函数
 *
 * @typedef {Object} CustomControl - 自定义操作列
 * @property {Array<ButtonBean>} buttons - 自定义按钮
 * @property {String} size - 按钮大小
 * @property {Number} width - 自定义列宽度
 * @property {String} type - 按钮样式
 */
import { h } from 'vue'
import { NSpace, NButton, NIcon } from 'naive-ui'
import { Search, Plus, Trash, Edit, User, Table, Home, Copy, ListAltRegular, Chrome, GlobeAsia, Coins, PaperPlane, Download, CheckCircle } from "@vicons/fa"

const resizable = true
const ellipsis  = { tooltip: true }

/**
 * 常用的图标
 */
export const icons = {
    Search: Search,
    Plus: Plus,
    Trash: Trash,
    Edit: Edit,
    User: User,
    Table: Table,
    Home: Home,
    Copy: Copy,
    List: ListAltRegular,
    Chrome: Chrome,
    Earth: GlobeAsia,
    Coins: Coins,
    PaperPlane: PaperPlane,
    Download:Download,
    CheckCircle: CheckCircle
}

export const tableConfig = ()=>({
    title:      "数据筛选",

    pid:        null,   //数据范围
    uid:        true,   //是否允许检索用户ID，如果为非空字符，则显示指定用户
    time:       true,   //是否允许按照时间段检索
    filters:    [],     //预设的筛选条件，如果为空则允许用户自行添加条件
    defaultCol: true,   //是否显示默认的列
    columns:    [],     //字段设置
    buttons:    [],
    pading:     false,  //是否允许分页
    pageSize:   200,    //每页查询的数据量
    desc:       false,

    export:     false,  //是否允许导出
    exportName: "",     //导出的文件名称
    exportType: "xlsx", //导出格式
    exportScript: "",   //数据导出的脚本，如果定义则显示下载按钮
})

/**
 * 基础列
 * @returns
 */
export function basicColumns(defaultCol=true){
    let cols = [{ title:"#", width:50, render:(_,i)=> i+1 }]
    if(defaultCol){
        cols.push(
            { title:"日期", key:"addOn", width: 170, render: row=> H.date.datetime(row.addOn) },
            { title:"录入者", key:"uid", width: 150 }
        )
    }

    return cols
}


function buildFuncBody(body, usePromise=true){
    return usePromise?
        `return new Promise((resolve, reject)=>{
            ${body}
        })`
        :
        body
}

function _triggerWithoutPromise(body, paramsNames, params){
    try{
        if(typeof(body) === 'function')
            return body(...params)
        return new Function(...paramsNames, buildFuncBody(body, false))(...params)
    }
    catch(e){
        console.error(e)
        M.showError(`执行函数回调出错：${UI.wrapHtml(e.message)}`)
    }
}

/**
 *
 * @param {Boolean} defaultCol - 是否显示默认列
 * @param {Array<ColumnBean>} customCols - 自定义列
 * @param {CustomControl} control - 自定义操作按钮
 * @returns {Object}
 */
export const buildCustomColumns = (defaultCol=true, customCols=[], control={})=>{
    let columns = basicColumns(defaultCol)
    let labels = {}
    customCols.forEach(c=>{
        /**@type {ColumnBean} */
        let col = { title: c.label, key:c.key, resizable, ellipsis }
        if(c.center==true)  col.align = "center"
        if(c.width>=0)      col.width = c.width

        //日期列（录入时间）
        if(c.key == "#date#"){
            col.width ??= 180
            col.render = row=> H.date.datetime(row.addOn)
        }
        //序号列
        else if(c.key == '#index#'){
            col.width ??= 60
            col.render = (r,i)=> `${i+1}`
        }
        //自定义渲染函数
        else{
            col.render = !!c.render? row=> new Function('row', 'h', 'return '+c.render)(row.v, h) : row=> row.v[c.key]
        }

        columns.push(col)
        labels[c.key] = c.label
    })

    let { buttons } = control
    // 自定义按钮
    if(Array.isArray(buttons) && buttons.length){
        let ctrlCol = { title:"操作", resizable, align: "center" }
        ctrlCol.width = control.width ?? buttons.reduce((c,v)=>c+v.label.length*24+(v.icon?65:0), 10)

        ctrlCol.render = (row, rowIndex)=> h(NSpace, {size:"small", justify: "center" }, ()=>buttons.map(btn=>{
            let slots = { }
            if(!!btn.label)
                slots['default'] = ()=> btn.label
            if(btn.icon)
                slots['icon'] = ()=> h(NIcon, {component: icons[btn.icon], class:'icon'})//h(icons[btn.icon], {class:"icon"})
            let onClick = undefined
            //删除数据行
            if(btn.category=='del'){
                onClick = ()=>M.confirm(
                    `删除数据`,
                    btn.handler ? H.io.render(btn.handler, row.v) : `确定删除该行数据吗？`,
                    ()=> H.data.remove({ id: row.id }).then(()=>{
                        console.debug(`数据行删除成功`)
                    })
                )
            }
            else if(btn.category=='view'){
                onClick = ()=>{
                    M.showData(
                        {
                            "键值": Object.entries(row.v),
                            "基本信息":[
                                ["数据编号", row.id],
                                ["应用编号", row.aid],
                                ["页面编号", row.pid],
                                ["用户编号", row.uid],
                                ["数据来源", row.channel],
                                ["录入日期", H.date.datetime(row.addOn)]
                            ]
                        },
                        { title: `数据信息` }
                    )
                }
            }
            else
                onClick = ()=>_triggerWithoutPromise(btn.handler, ['row', 'rowIndex'], [row, rowIndex])

            let ps = { type: btn.type||"default", onClick, size: control.size }
            if(control.type)
                ps[control.type] = true
            return h(NButton, ps, slots)
        }))

        columns.push(ctrlCol)
    }

    return { columns, labels }
}

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
