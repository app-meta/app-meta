const { got } = require("got-cjs")
const { readFileSync } = require("fs")
const logger = require("../common/logger")
const { basename } = require("path")
const FormData = require("form-data")
const { createReadStream } = require("fs")
const C = require("../Config")
const { isDev } = require("../Runtime")

// const axios = require("axios"
// const iconv = require('iconv-lite')
let MUA = ""
const method = "POST"

/**
 * 使用 axios 无法处理中文乱码，试了好多方法均告失败
 * 故选择 got 库
 */
// export function FETCH(url, data, options={}){
//     return new Promise((ok, fail)=>{
//         let headers = Object.assign(
//             {
//                 // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
//                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"
//             },
//             options.headers||{}
//         )
//         axios({
//             url,
//             data,
//             ...options,
//             headers
//         })
//         .then(response=>{
//             console.debug(response.data)

//             // ok(iconv.decode(response.data, "utf8", {stripBOM: false, addBOM: true}))
//             ok(response.data)
//         })
//         .catch(e=> {
//             fail(e)
//         })
//     })
// }

const UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"

// export function REMOTE(url, data, options={}){
//     return new Promise(async (ok, fail)=>{
//         let result = await got(
//             url,
//             {
//                 method: "POST",
//                 json: data,
//                 headers: Object.assign({"User-Agent": UserAgent}, options.headers||{})
//             }
//         )
//         .json()
//         .catch(e=> fail(e.message))

//         ok(result)
//     })
// }

exports.REMOTE = async function(url, data, options={}){
    return await got(
        url,
        {
            method,
            json: data,
            headers: Object.assign({"User-Agent": UserAgent}, options.headers||{})
        }
    )
    .json()
    .catch(e=> {throw Error(e.message)})
}

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

    let result = await got(url, { method, json, headers: Object.assign({ MUA }, options.headers||{}) }).json()
    if(result.success === true)
        return result

    throw Error(`调用接口 ${action} 出错：${result?.message}`)
}

exports.setToken = token => MUA = token
exports.getToken = ()=> MUA
