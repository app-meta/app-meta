import { toRaw, unref } from 'vue'

import * as H from "@app-meta/library"
// import "./electron"
import UI from "./ui-tool"
import './http'

window.H = H
window.UI = UI

/**
 * 将 Proxy 对象转换为普通 Object
 *
 * 方式一：return {...(ref.value||ref)}
 *      该方法无法处理嵌套对象，故选用 JSON 反序列化方式
 *
 * 方式二： 使用 vue3 自带的 toRaw(unref(bean)) 方式
 * @param {*} ref
 * @returns
 */
let _ = ref=> {
    // return toRaw(unref(ref))
    return JSON.parse(JSON.stringify(ref.value||ref))
}

window._    = _
window._raw = ref=> toRaw(unref(ref))

window.isClient = !!window.META

/**
 * 调用客户端接口（invoke 方式，需要返回值）
 * @param {*} id
 * @param  {...any} ps
 * @returns
 */
window.callClient = (id, ...ps)=>{
    if(isClient && window.META[id]){
        if(process.env.NODE_ENV === 'production'){
            console.debug(`%c[调用客户端接口]`, "background:#2080f0;padding:3px;color:white", `ID=${id}`)
        }
        else
            console.debug(`%c[调用客户端接口]`, "background:#2080f0;padding:3px;color:white", `ID=${id}`, ...ps)

        return META[id](...ps).catch(e=>{
            let msg = e.message
            let index = msg.indexOf(":")
            M.dialog({
                content: UI.html(`<div>${msg.substring(index+1).trim()}</div><div class="mt-3 h">${msg.substring(0, index)}</div>`),
                title: `调用客户端接口失败`,
                type:"error",
                style:{ width:"640px" },
                transformOrigin:"center",
                positiveText:"朕知道了"
            })
        })
    }
}
