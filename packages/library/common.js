import dayjs from "dayjs"

const globalName = "meta"

let contextPath

// 简单的参数拼接，不支持数组
const stringify = params=> Object.keys(params).map(v=>`${v}=${params[v]}`).join("&")

/**
 * 处理 Fetch，如果返回值不符合规范，则报错（可通过 .catch 获取）
 * @param {*} response
 * @returns
 */
const handleResponse = response=> response.json().then(json=>{
    if(response.ok && json.success===true)
        return json
    else
        return Promise.reject(json)
})

export { globalName }

/**
 * 配置后端服务总地址
 * @param {String} prefix
 * @returns
 */
export const setContextPath = prefix=> contextPath = prefix

/**
 * 以 POST 形式与后端进行交互
 * @param {*} model
 * @param {*} action
 * @returns
 */
export const withPost = (action="", data, json=true, handler=handleResponse)=>{
    contextPath ??= window.SERVER

    return fetch(
        `${contextPath}${action[0]=='/'?"":"/"}${action}`,
        {
            method: "POST",
            headers:{ CHANNEL: window.CHANNEL, "MUA": localStorage.getItem("MUA"), 'Content-Type': json?'application/json':'application/x-www-form-urlencoded'},
            body: data ? (json ? JSON.stringify(data) : stringify(data)):undefined
        }
    ).then(handler)
}

export const withGet = (action="", contextPath=window.SERVER, handler=handleResponse)=> fetch(
        `${contextPath}${action[0]=='/'?"":"/"}${action}`,
        {
            method:"GET",
            headers:{ CHANNEL: window.CHANNEL, "MUA": localStorage.getItem("MUA")}
        }
    ).then(handler)


/**
 * 打开新页面（同源）
 * @param {*} target
 */
export const openUrl = (target, ps={})=>{
    ps = Object.assign(
        {
            title:"",
            width:1320,
            height:720,
            type:"_blank",
            x: 0,
            y: 0,
            center: false         //是否居中
        },
        ps
    )
    let options = undefined
    if(ps.type == '_blank'){
        // 一旦设置了宽度，则打开新窗口
        options = `width=${ps.width},height=${ps.height}`
        if(ps.center) {
            let top = (window.screen.availHeight - ps.height)/2
            let left = (window.screen.availWidth - ps.width)/2
            options+=`,top=${top},left=${left}`
        }
        else if(ps.x>0 || ps.y>0){
            options+=`,top${ps.y},left=${ps.x}`
        }
    }

    let newWin = window.open(target, ps.type, options)
    if(!!ps.title && !!newWin){
        newWin.onload = function(){
            newWin.document.title = ps.title
        }
    }
    return newWin
}

const COLORS = {"INFO":"#2080f0", "DEBUG":"#8c0776", "ERROR":"#d03050"}
/**
 *
 * @param {String} level
 * @param  {...any} ps
 * @returns
 */
const log = (level, ...ps)=> console.debug(`%c${dayjs(new Date).format("HH:mm:ss")} ${level}`, `color:${COLORS[level]};font-weight:500;`, ...ps)

export const logger = {
    info    : (...ps)=> log("INFO", ...ps),
    debug   : (...ps)=> log("DEBUG", ...ps),
    error   : (...ps)=> log("ERROR", ...ps)
}
