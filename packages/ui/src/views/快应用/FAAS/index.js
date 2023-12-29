export const SQL            = "sql"
export const JS             = "js"

export const funcModes      = [{ label:"纯SQL", value: SQL }, { label:"JavaScript脚本", value: JS }]
export const resultTypes    = [{ label:"对象（键值对）", value:"Object" }, { label:"一维数组", value:"Array" }]
export const paramsTypes    = [{ label:"字符串", value:"string" }, { label:"数值", value:"number" }, { label:"布尔型", value:"boolean" }]

/**
 * @typedef {Object} FuncParmeter
 * @property {String} id - 参数ID
 * @property {String} name - 参数中文名
 * @property {String} value - 默认值
 * @property {Boolean} required - 是否为必填项
 * @property {String} regex - 校验正则表达式
 * @property {String} type - 数据类型，可选：string、number、boolean
 */

export const createFaas = ({
    mode: SQL,
    summary:"",
    params: [],
    paramsLimit: false,
    sourceId: null,
    cmd: "",
    resultType: "Object"
})
