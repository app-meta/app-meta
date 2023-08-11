/*
 * @Author: 集成显卡
 * @Date: 2022-08-23 13:04:59
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-08-17 10:21:38
 *
 *
 * 注意：
 * ① 统一使用 json 提交数据
 */

import axios from 'axios'
import qs  from 'qs'

import { tryLoginWithCAS } from "@S/Auth"

//默认的 server 前缀为空
window.SERVER = process.env.VUE_APP_CONTEXT

let _dealWithErrorRequest = (url, error, onFail)=>{
    M.loadingBar.error()

    if(!!onFail && typeof(onFail) === 'function'){
        if(onFail(error? error.response: null) === true)    return
    }
    console.debug(error)
    let content = ""
    let meta    = ""

    if(error.response && error.response.status) {
        meta    = `CODE=${error.response.status}`
        content = error.response.status == 404 ? "请求的接口不存在": error.response.data.message
    }
    else{
        meta    = "程序逻辑错误"
        content = error.message
    }

    window.M.notice.create({ type:"error", content, title:"数据接口异常", description: url, meta})
}

/**
 * 支持跨域提交数据
 * @param {*} url
 * @param {*} body
 * @param {*} method
 * @returns
 */
window.FETCH_JSON = (url, body, widthToken=false, method="post")=> {
    let headers = {'Content-Type': 'application/json', CHANNEL }
    if(widthToken)  headers["MUA"] = localStorage.getItem("MUA") || window.TOKEN || ""

    return fetch(url, {method, body:JSON.stringify(body), headers})
        .then(v=>v.json())
        .catch(e=>{
            if(!window.M)   return alert(`${e.message}\n\n${url}`)
            M.dialog({type:"error", title:"数据交互失败", description:url, content: e.message })
        })
}

/**
 * 发送POST请求到服务器
 * @param url
 * @param data
 * @param onOk
 * @param onFail
 * @constructor
 */
window.POST=(url,data,onOk,onFail, useJson=true, headers={})=>{
    M.loadingBar.start()

    //提交数据到服务器
    axios.post(window.SERVER + url, useJson ? data : qs.stringify(data||{}), {headers}).then(function (response) {
        if(response.status===200){
            M.loadingBar.finish()
            if(onOk) onOk(response.data)
        }
        else{
            M.notice.error(`POST ${url} 失败\n响应码：${response.status}`)
        }
    }).catch(function (error) {
        _dealWithErrorRequest(url,error, onFail)
    })
}
window.GET=(url,data,onOk,onFail)=>{
    axios.get(window.SERVER + url, {params: data}).then(function (response) {
        if(response.status===200){
            if(onOk) onOk(response.data)
        }else{
            M.notice.error(`GET ${url} 失败\n响应码：${response.status}`)
        }
    }).catch(function (error) {
        _dealWithErrorRequest(url, error, onFail)
    })
}
/**
 * 对于返回Result对象的请求封装
 * @param url
 * @param data
 * @param onOk
 * @param onFail
 * @constructor
 */
// window.RESULT=(url,data,onOk,onFail, useJson=true, headers={})=>{
//     POST(url,data,function (res) {
//         if(res.success === true && onOk) onOk(res)
//         else{
//             //当自定义了异常处理函数，就优先调用，当 onFail 返回 true 时不显示系统级别的错误提示
//             let notShowError = onFail && onFail(res)===true
//             if(!notShowError){
//                 M.notice.create({
//                     type:"error",
//                     content: res.message,
//                     title:"数据接口异常",
//                     description: url
//                 })
//             }
//         }
//     },onFail, useJson, headers)
// }

/**
 * 更新 loading
 * @param {*} ps        包含 loading 的对象或者其本身
 * @param {*} newVal
 */
const _loading = (ps, newVal=false)=>{
    if(ps.loading)
        ps.loading.value!==undefined? ps.loading.value = newVal : ps.loading = newVal
    else
        ps.value !== undefined? ps.value = newVal : ps = newVal
}

/**
 * 对于返回 Result 对象的请求封装
 * @param {*} url   请求地址
 * @param {*} data  参数
 * @param {*} onOk  请求成功后回调函数
 * @param {*} ps    额外设置
 *                      fail    请求失败后的回调函数
 *                      json    是否以 JSON 格式提交参数
 *                      headers 自定义请求头
 *                      loading 加载中的开关（RefImpl 类型），在开始请求时设置为 true，请求结束（无论成功与否）都设置为 false
 */
window.RESULT=(url,data,onOk, ps={})=>{
    ps = Object.assign(
        {
            fail (){},          //失败时的回调函数
            json: true,         //是否以 JSON Body 形式提交参数
            headers:{},         //自定义请求头
            loading:undefined   //加载中开关
        },
        ps
    )
    _loading(ps, true)

    POST(
        url,data,
        function (res) {
            _loading(ps)

            if(res.success === true) onOk && onOk(res)
            else{
                if(res.message==="NOT LOGIN"){
                    if(window._NOT_LOGIN_ != true){
                        window._NOT_LOGIN_ = true
                        M.warn('请先登录再使用该功能')
                        return tryLoginWithCAS(location.hash) && E.emit("jumpTo", {name:"login"}, true)
                    }
                    return
                }

                //当自定义了异常处理函数，就优先调用，当 onFail 返回 true 时不显示系统级别的错误提示
                let notShowError = ps.fail && ps.fail(res)===true
                if(!notShowError){
                    M.notice.create({
                        type:"error",
                        content: res.message,
                        title:"数据接口异常",
                        description: url
                    })
                }
            }
        },
        function (e){
            _loading(ps)

            if(ps.fail)     ps.fail(e)
        },
        ps.json,
        { CHANNEL: window.CHANNEL, ...ps.headers}
    )
}

/**
 * 使用 Promise 封装 RESULT 函数
 * @param {*} url
 * @param {*} data
 * @returns
 */
window.RESULT2 = (url, data={})=> new Promise((ok, fail)=>{
    RESULT(url, data, res=> ok(res.data), { fail })
})

/**
 * 使用 axios 上传文件
 * 需要设置头部
 */
window.UPLOAD = (url, data, onOk, onFail)=>{
    let form = new FormData()
    Object.keys(data).forEach(k=> form.append(k, data[k]))
    RESULT(url, form, onOk, {fail: onFail, json: true, headers: {'Content-Type': "multipart/form-data"}} )
}

/**
 * 下载文件到本地（使用 axios）
 * 程序如何判断是否为异常（后端异常返回的是 JSON 格式的异常信息）
 * 1. 后端没有返回文件名
 * 2. 返回的格式为 application/json
 *
 * ----------------------------------------------------------------------------
 * 另外一种下载方式：
 * window.open("/attach/zipDownload")
 *
 * @param url
 * @param data      表单参数
 * @constructor
 */
window.DOWNLOAD=(url, data, ps={})=>{
    ps = Object.assign(
        {
            onOk: undefined,        //默认成功后：M.notice({文件名}, "文件下载成功")
            onFail:undefined,       //默认失败后通过 alert 打印错误信息
            json:false,             //是否使用 JSON 格式提交参数
            fName:null,             //下载后文件名，若不为空则强制修改为该文件名
            useGet:false,           //是否使用 GET 方式下载
            handler:undefined       //文件对象的自定义处理函数
        },
        ps
    )
    let form = new FormData()
    let headers = { CHANNEL: window.CHANNEL }
    if(ps.json){
        Object.keys(data).forEach(k=> form.append(k, data[k]))

        headers['Content-Type'] = "multipart/form-data"
    }
    let method = ps.useGet? axios.get:axios.post
    //提交数据到服务器
    method(window.SERVER + url, ps.json?form:qs.stringify(data||{}), {responseType: 'blob', headers}).then(function (response) {
        let headers = response.headers
        let contentType = headers['content-type']

        if(!response.data){
            console.error("服务器响应异常", response)
            return ps.onFail && ps.onFail(response)
        }

        const blob = new Blob([response.data], {type: contentType})
        const contentDisposition = headers['content-disposition']
        const length = headers['content-length']
        let fileName = ps.fName
        if (!fileName && contentDisposition) {
            fileName = window.decodeURI(contentDisposition.split('=')[1])
        }

        //判断是否为后端出错
        if((!fileName || !contentDisposition) && response.data.type=="application/json"){
            let fileReader = new FileReader()
            fileReader.onload = e=>{
                let jsonText = fileReader.result
                let result = JSON.parse(jsonText)

                console.debug("来自后端的下载响应：", result)

                //如果 onFail 返回 false 则不显示错误窗口
                let showErrorMsg = !onFail || (onFail && onFail(result)!=false)
                if(showErrorMsg){
                    let content = UI.html(`<div class="error">${result.message}</div><br>
                    <span class="h">1. 请确认您提交的参数是否正确后再重试<br>2. 若错误依旧请联系<b class="info">信息科技部</b>。</span>`
                    )
                    M.dialog({content, title:"文件下载失败（服务器响应内容如下）", type:"error"})
                }
            }
            fileReader.readAsText(response.data)
        }
        else {
            fileName = fileName || ("文件下载-"+H.date.datetime(H.date.now(), "YYYYMMDDHHmmss"))
            /**
             * 如果自定义了处理函数
             *
             * handler 于 onOk 不能同时被回调
             */
            if(typeof(ps.handler)=='function'){
                ps.handler(blob, fileName)
            }
            else{
                //默认保存到文件中
                H.io.saveToFile(blob, fileName)

                if(onOk)
                    onOk({fileName, contentType, headers, length})
                else
                    M.notice.ok(fileName, "文件下载成功")
            }
            // let link = document.createElement('a')
            // // 非IE下载
            // if ('download' in link) {
            //     link.href = window.URL.createObjectURL(blob)    // 创建下载的链接
            //     link.download = fileName                        // 下载后文件名
            //     link.style.display = 'none'
            //     document.body.appendChild(link)
            //     link.click()                                    // 点击下载
            //     window.URL.revokeObjectURL(link.href)           // 释放掉blob对象
            //     document.body.removeChild(link)                 // 下载完成移除元素
            // } else {
            //     // IE10+下载
            //     window.navigator.msSaveBlob(blob, fileName)
            // }
        }
    }).catch(function (error) {
        _dealWithErrorRequest(url,error, onFail)
    })
}


/**
 * 调用 main 主进程的接口
 *
 * @param {*} channel
 * @param  {...any} ps
 * @returns
 */
window.API = (channel, ...ps)=>{
    if(!(window.META && typeof(META.api)==='function'))
        return M.error(`API 仅在客户端内有效`)

    M.loadingBar.start()
    return META.api(channel, ...ps)
        .then(d=>{
            M.loadingBar.finish()
            return d
        })
        .catch(e=>{
            M.loadingBar.error()
            _onFail(e, channel)
        })
}

export default {}
