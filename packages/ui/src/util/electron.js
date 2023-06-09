/**
 * 对接 electron main 进程
 *
 */
const COLOR = "background:green;"

let _onFail = (e, channel, data)=>{
    let content = typeof(e)==='string'? e: e.message.replace(/Error invoking remote method '.*': /g,"")
    window.M.notice.create({
        type:"error",
        content: content.replace(/^Error: /, ""),
        title:"主进程接口异常",
        description:`channel=${channel}`,
        meta: H.date.datetime()
    })
}

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

window.RESULT = async (suffix, data, onOk, ps={})=>{
    M.loadingBar.start()

    ps = Object.assign(
        {
            fail    : _onFail,      //失败时的回调函数
            json    : true,         //是否以 JSON Body 形式提交参数
            headers : {},           //自定义请求头
            loading : undefined     //加载中开关
        },
        ps
    )
    _loading(ps, true)

    // 不自动进行转换，需要在调用方自行转换，否则无法正常发送到 electron 后台
    // let data = _(_data)
    console.debug(`%c[API] ${suffix} 参数`, "background:#939597;padding:3px", data, "OPTIONS", ps)
    META.remote(suffix, data, {useJson: ps.json, headers: ps.headers, _FILE_:ps._FILE_})
        .then(d=>{
            _loading(ps)

            console.debug(`%c[API] ${suffix} 响应`, "background:#88B04B;padding:3px", d)
            if(d.success===true){
                M.loadingBar.finish()
                onOk && onOk(d)
            }
            else{
                M.loadingBar.error()
                ps.fail(d.message, suffix)
            }
        })
        .catch(e=>{
            _loading(ps)

            M.loadingBar.error()
            ps.fail(e, suffix, data)
        })
}

/**
 * 文件上传
 * @param {*} url
 * @param {*} data
 * @param {*} onOk
 * @param {*} ps
 */
window.UPLOAD = (url, data, onOk, ps={})=>{
    ps._FILE_ = true
    RESULT(
        url,
        data,
        onOk,
        ps
    )
}

/**
 * 调用主进程的接口
 * @param {*} channel
 * @param  {...any} ps
 * @returns
 */
window.API = (channel, ...ps)=>{
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
