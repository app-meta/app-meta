import { withPost, openUrl } from "../common"

/**
 * 运行应用，默认以新窗口打开（不判断应用预设的属性，如窗口大小）
 * @param {*} id
 * @returns
 */
export const run=(id)=> runPage(id, null, true)

/**
 * 运行页面
 *
 */
export const runPage=(aid, pid, blank=false)=>{
    let url = `${location.origin}${location.pathname}#/app/${aid}`
    if(pid)
        url += `/${pid}`
    blank? H.openUrl(url): location.href = url
}


const _runApp = ({app, property })=>{
    if(property.native === true && !window.META){
        throw Error(`应用「${app.name}」需要在<原生环境>下执行，请在桌面客户端启动`)
        // return M.dialog({
        //     type:"error",
        //     title:"应用启动失败",
        //     content: UI.html(`应用「${app.name}」需要在 <b class="primary">原生环境</b> 下执行，请在桌面客户端启动`)
        // })
    }
    let width = property.winMax ? window.screen.availWidth : property.winWidth
    let height = property.winMax ? window.screen.availHeight : property.winHeight

    openUrl(`#/app/${app.id}`, { title:app.name, width, height, center: !property.winMax })
    // M.ok(`应用「${app.name}」已启动`)
}

/**
 * 读取应用信息并启动
 * @param {*} appOrId 应用对象或者 ID
 */
export const loadAndRun = (appOrId)=> new Promise((ok, fail)=>{
    let id = typeof(appOrId) === 'string'? appOrId : appOrId.id
    if(!!id){
        withPost(`/app/detail`, {id})
            .then(d=> {
                if(!d || !d.data || !d.data.app)    throw Error(`远程服务器返回无效的应用信息`)

                let { app, property } = d.data
                if(property.native === true && !window.META)
                    throw Error(`应用「${app.name}」需要在<原生环境>下执行，请在桌面客户端启动`)

                let width = property.winMax ? window.screen.availWidth : property.winWidth
                let height = property.winMax ? window.screen.availHeight : property.winHeight

                openUrl(`#/app/${app.id}`, { title:app.name, width, height, center: !property.winMax })
                ok(app)
            })
            .catch(fail)
    }
    else
        throw Error(`无效的参数，请传递 App 对象或者 ID`)
})

/**
 * 启动某个机器人
 * @param {String|Number}   id
 * @param {Object}          params
 * @returns
 */
export const runRobot = (id, params={})=> {
    if(!window.META)    throw Error(`RPA 机器人需要在<原生环境>下执行，请在桌面客户端启动`)

    return typeof(callClient)==='function'? callClient('runRobot', id, params) : META.runRobot(id, params)
}
