import { withPost, withGet } from "../common"
import { saveToFile } from "./io"

const buildServiceUrl = (aid, path)=> `service/${aid}/${path.startsWith("/")?path.substr(1):path}`


export const get = (aid, path, responseHandler) => withGet(buildServiceUrl(aid, path), responseHandler)

/**
 * 调用后端服务（必须返回 JSON 格式的对象或者字符串）
 *
 * @param {String} aid                  应用ID
 * @param {String} path                 服务地址
 * @param {Object} data                 Object 类型的参数
 * @param {Boolean} useJson             是否使用 JSON 格式提交（默认 true）
 * @param {Function} responseHandler    fetch 方法的响应处理，默认是转换为 JSON 格式
 *                                          如果后端返回文件流，则可以参考 _exportData 进行 blob 处理
 */
export const json = (aid, path, data, useJson=true, responseHandler)=> withPost(buildServiceUrl(aid, path), data, useJson, responseHandler)

/**
 * 处理纯文本的远程返回内容
 * withPost(buildServiceUrl(path, specialAid), data, useJson, prefix, response=> response.text())
 * @param {*} path
 * @param {*} data
 * @param {*} useJson
 * @param {*} specialAid
 */
export const text = (aid, path, data, useJson=true) => json(aid, path, data, useJson, res=>res.text())

/**
 * @typedef {Object} DownloadConfig
 * @property {Boolean} json - 是否使用JSON格式传递参数
 * @property {String} fName - 指定保存的文件名
 */

/**
 * 下载文件
 * @param {String} aid - 应用ID
 * @param {String} path - 后端路径
 * @param {Object} data - 参数
 * @param {DownloadConfig} config - 是否使用JSON格式传递参数
 * @returns
 */
export const download = (aid, path, data, config={})=> new Promise((ok, reject)=>{
    config = Object.assign({json:true, fName:undefined}, config)

    let filename = config.fName
    let headers = {}
    let length = -1
    json(
        aid, path, data, config.json,
        async res=>{
            if(res.headers.get("content-type") == 'application/json'){
                let json = await res.json()
                throw Error(json.message)
            }
            //尝试从响应头中取得文件名称
            const contentDisposition = res.headers.get('content-disposition')
            if (!filename && contentDisposition) {
                filename = window.decodeURI(contentDisposition.split('=')[1])
            }
            //解析headers
            for (var h of res.headers.entries()) {
                headers[h[0]] = h[1]
            }
            length = res.headers.get('content-length')||-1

            return res.blob()
        }
    )
    .then(b=>{
        saveToFile(b, filename)
        ok({filename, headers, length})
    })
    .catch(e=> reject(e.message))
})
