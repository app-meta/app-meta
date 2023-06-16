/**
 * 2023-06-16
 *  不知为何，electron-builder 打包后运行 exe 报 require() ES Module not supported 错误（引入 got 库时）
 *  但是直接通过 electron . 执行就没有问题
 *  尝试更换 electron、electron-builder、got 版本均未果
 *  时间所迫，更换为 axios
 *
 *
 *  const { got } = require("got-cjs")
 */

const axios = require("axios")
const logger = require("../common/logger")
const FormData = require("form-data")
const { createReadStream } = require("fs")
const C = require("../Config")
const { isDev } = require("../Runtime")

let MUA = ""
const method = "POST"

const UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"

// 基于 GOT 的历史代码
// exports.REMOTE = async function(url, data, options={}){
//     return await got(
//         url,
//         {
//             method,
//             json: data,
//             headers: Object.assign({"User-Agent": UserAgent}, options.headers||{})
//         }
//     )
//     .json()
//     .catch(e=> {throw Error(e.message)})
// }

exports.REMOTE = async (url, data, options={}) => new Promise(ok=>{
    axios({
        url,
        data,
        ...options,
        headers: Object.assign({"User-Agent": UserAgent}, options.headers||{}),
        method
    })
    .then(response=> ok(response.data))
    .catch(e=> {throw Error(e.message)})
})

/**
 * 提交文件到远程服务器
 *
 * 通常以 data.file 作为待上传文件
 *
 * 上传一个文件：
 *      { file:"文件路径" }
 *      此时后端通过接收 file 获取
 *
 * 上传多个文件：
 *      { file:{ file01:"文件1路径", file02:"文件2路径"} }
 *      此时后端通过接收 file01、file02 获取
 *
 * @param {*} url
 * @param {*} data
 * @param {*} options
 * @returns
 */
exports.REMOTE_UPLOAD = async function(url, data, options={}){
    let headers = Object.assign({"User-Agent": UserAgent}, options.headers||{})
    let body = new FormData()

    Object.keys(data).forEach(k=> {
        if(k==='file'){
            if(typeof(data[k]) === 'string')
                body.append(k, createReadStream(data[k]))
            else if(typeof(data[k])==='object'){
                Object.keys(data[k]).forEach(fileKey=>{
                    body.append(fileKey, createReadStream(data[k][fileKey]))
                })
            }
            else
                throw Error(`参数 file 填写有误（仅接受 String 或者 Object）`)

            let _headers = body.getHeaders()
            Object.keys(_headers).forEach(key=> headers[key] = _headers[key])
        }
        else
            body.append(k, data[k])
    })
    return await got(url, { method, body, headers }).json().catch(e=> {throw Error(e.message)})
}

/**
 * 调用 app-meta-server 的接口
 * @param {*} action
 * @param {*} json
 * @param {*} options
 * @returns
 */
exports.callServer = async (action, json, options={})=>{
    if(!MUA)  throw Error(`用户 TOKEN 未设置`)
    let url = `${C.serverHost}${C.serverContext}${action}`

    if(isDev) logger.debug(`调用接口 ${url}， 参数：${JSON.stringify(json)}`)

    // let result = await got(url, { method, json, headers: Object.assign({ MUA }, options.headers||{}) }).json()
    let result = await axios({url, method, data: json, headers: Object.assign({ MUA }, options.headers||{}) })
    let { data } = result
    if(data.success === true)
        return data

    throw Error(`调用接口 ${action} 出错：${data?.message}`)
}

exports.setToken = token => {
    MUA = token
    if(isDev) logger.debug(`设置 token`, token)
}
exports.getToken = ()=> MUA
