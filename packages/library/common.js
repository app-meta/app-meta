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
    }

    let newWin = window.open(target, ps.type, options)
    if(!!ps.title && !!newWin){
        newWin.onload = function(){
            newWin.document.title = ps.title
        }
    }
    return newWin
}
