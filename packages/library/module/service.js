import { withPost, withGet } from "../common";

const buildServiceUrl = (aid, path)=> `service/${aid}/${path.startsWith("/")?path.substr(1):path}`


export const get = (aid, path, responseHandler) => withGet(buildServiceUrl(aid, path), window.SERVER, responseHandler)

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
export const json = (aid, path, data, useJson=true, responseHandler)=> withPost(buildServiceUrl(aid, path), data, useJson, window.SERVER, responseHandler)

/**
 * 处理纯文本的远程返回内容
 * withPost(buildServiceUrl(path, specialAid), data, useJson, prefix, response=> response.text())
 * @param {*} path
 * @param {*} data
 * @param {*} useJson
 * @param {*} specialAid
 */
export const text = (aid, path, data, useJson=true) => service(aid, path, data, useJson, res=>res.text())
