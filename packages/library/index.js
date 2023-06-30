import * as date from './module/date'
import * as store from './module/store'
import * as is from './module/is'
import * as excel from './module/excel'
import * as io from './module/io'
import * as secret from './module/secret'
import * as util from './module/util'
import * as api from './module/api'
import * as app from './module/app'
import * as data from './module/data'
import * as service from './module/service'

import { openUrl, withPost as post } from "./common"

export {
    date,
    store,
    is,
    excel,
    io,
    secret,
    util,

    api,
    app,
    data,
    service
}

/**
 * 获取指定对象（转换为 JSON 字符串后）的 哈希 值
 * @param {*} obj
 * @param {*} caseSensitive
 * @returns
 */
export const hashCode = (obj = null, caseSensitive = false)=>{
    obj = JSON.stringify(obj)
    if (!caseSensitive) obj = obj.toLowerCase()

    var hash = 100000000, i, ch
    for (i = obj.length - 1; i >= 0; i--) {
        ch = obj.charCodeAt(i)
        hash ^= ((hash << 5) + ch + (hash >> 2))
    }

    return (hash & 0x7FFFFFFF)
}

/**
* 格式化文件大小
* @param {*} mem
*/
export const filesize = (mem, fixed=1, split=" ")=>{
    var G = 0
    var M = 0
    var KB = 0
    mem >= (1 << 30) && (G = (mem / (1 << 30)).toFixed(fixed))
    mem >= (1 << 20) && (mem < (1 << 30)) && (M = (mem / (1 << 20)).toFixed(fixed))
    mem >= (1 << 10) && (mem < (1 << 20)) && (KB = (mem / (1 << 10)).toFixed(fixed))
    return G > 0
        ? G + split + 'GB'
        : M > 0
            ? M + split + 'MB'
            : KB > 0
                ? KB + split + 'KB'
                : mem + split + 'B'
}

/**
 *
 * @param {*} name
 */
export const setTitle = (name)=> document.title = name

/**
 * 转换为千位符
 * @param {*} num
 * @returns
 */
export const toThousands =  (num)=>{
    let ps = (num || 0).toString().split(".")
    ps[0] = ps[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return ps.join(".")
}

export const split = (text, splitor = ",") => typeof (text) == 'string' && text ? text.split(splitor) : []

/**
 * 将指定数据写入到系统粘贴板
 * @param {*} obj   如果为非字符串，事先进行 JSON 转换
 * @returns
 */
export const copyTo = (obj, pretty=false)=> {
    let text = typeof(obj)=='string'? obj: JSON.stringify(obj, null, pretty?4:0)
    // 优先使用原生客户端提供的功能，无需 document 聚焦
    if(window.META && window.META.copyText)
        META.copyText(text)
    // 仅在 localhost 或者 https 环境下才能使用该 API
    else if(navigator.clipboard)
        navigator.clipboard.writeText(text)
    else {
        // // 创建text area
        // let textArea = document.createElement("textarea")
        // textArea.value = text
        // // 使text area不在viewport，同时设置不可见
        // textArea.style.position = "absolute"
        // textArea.style.opacity = 0
        // textArea.style.left = "-99999px"
        // textArea.style.top = "-99999px"
        // document.body.appendChild(textArea)
        // textArea.focus()
        // textArea.select()
        // document.execCommand('copy')
        // textArea.remove()

        const textarea = document.createElement('textarea')
        textarea.addEventListener('focusin', (event) => event.stopPropagation())
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.cssText =  'position:fixed; pointer-events:none; z-index:-9999; opacity:0;'

        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
    }
}

/**
 * 判断参数是否为一个有内容的字符串
 * @param {*} v
 * @returns
 */
export const hasText = v=>{
    if(v == null)   return false
    if(typeof(v)==='string') return /[^\s]/.test(v)
    return false
}

export { openUrl, post }
