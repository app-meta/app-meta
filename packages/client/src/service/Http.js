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
const { isDev, verbose } = require("../Runtime")
const { aes } = require("@app-meta/basic")
const { buildRemoteUrl } = require("./Helper")

let MUA = ""
const method = "POST"
const CHANNEL = "client"

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

/**
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns
 */
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
    let url = buildRemoteUrl(action)

    if(isDev) logger.debug(`调用接口 ${url}， 参数：${JSON.stringify(json)}`)

    // let result = await got(url, { method, json, headers: Object.assign({ MUA }, options.headers||{}) }).json()
    let result = await axios({url, method, data: json, headers: Object.assign({ MUA, CHANNEL }, options.headers||{}) })
    let { data } = result
    if(data.success === true)
        return data

    throw Error(`调用接口 ${action} 出错：${data?.message}`)
}

/**
 * 从远程服务器获取 TOKEN，需要先配置会员终端
 * @param {String} secretKey - 密钥
 * @param {String} uid - 用户ID
 * @returns {Promise}
 */
exports.loadTokenFromServer = (secretKey, uid)=>new Promise((ok, fail)=>{
    let text = Buffer.from(aes.encrypt(`${uid}-${Date.now()}`, secretKey)).toString('base64')

    axios.get(buildRemoteUrl(`/outreach/create-token`), { params:{ text }, responseType:'text' })
        .then(res=>{
            if(res.status === 200){
                /** @type {String} */
                let token = res.data
                if(token.startsWith("{")){
                    let json = JSON.parse(token)
                    throw Error(`无法获取 TOKEN：${json.message}`)
                }
                verbose && logger.info(`成功获取到 TOKEN ${token.substring(0, 10)}...`)
                this.setToken(token)
                ok(token)
            }
            else{
                verbose && logger.info(`无法获取 TOKEN，CODE=${res.status}`)
                fail(`无法获取授权TOKEN`)
            }
        })
        .catch(e=>fail(e.message))
})

/**
 *
 * @param {String} token
 */
exports.setToken = token => {
    MUA = token?.trim()
    if(isDev) logger.debug(`设置 token`, MUA)
}

/**
 * 发送数据（POST）到指定地址，RequestBody/JSON 格式
 * @param {*} url
 * @param {*} data
 * @param {*} options
 * @returns
 */
exports.withPost = async (url, data, options={})=>{
    let ps = Object.assign({ headers:{ "User-Agent":"app-meta/client" }, token: false }, options)
    if(ps.token === true) Object.assign(ps.headers, { MUA })

    if(isDev)   logger.debug(`[POST 数据] 到 ${url}`)

    try {
        let result = await axios({url, method, data, headers: ps.headers})
        return result.data
    } catch (error) {
        throw Error(`[POST 数据] 出错：${error?.message}`)
    }
}

/**
 * 获取 token
 * @returns
 */
exports.getToken = ()=> MUA
