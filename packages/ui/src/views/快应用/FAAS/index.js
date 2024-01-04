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

export const demoJSCode = `
/**
 * 1. 兼容 ECMAScript 2022 语法（为顺利执行，尽量使用简单严谨语法）
 * 2. 全局变量：params（入参）、user（用户对象）、meta（平台服务）、appId（应用ID），详见帮助文档
 * 3. 代码最后一行视为返回值
 * 4. 如遇语法错误，请尝试在问题行前后增加分号
 */
let result = { time:Date.now(), name:"demo-js-FaaS" }
// 返回结果
result
`
