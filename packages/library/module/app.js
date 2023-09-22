import { withPost, openUrl } from "../common"
import { get } from "./db"
import { compress } from "./io"


/**
 * 准备打开该页面的窗口信息
 * @param {String} aid
 * @param {String} pid
 * @param {Object} params
 * @param {Boolean} pure - 是否使用纯净模式，此时不显示底部的信息
 * @returns
 */
export const prepare = (aid, pid, params, pure=false)=> new Promise((ok)=>{
    let url = `${location.origin}${location.pathname}#/app${pure?'-pure':''}/${aid}`
    if(pid)
        url += `/${pid}`
    if(params)
        url += `?params=${encodeURIComponent(compress(params))}`

    let option = {}
    get('window', `${window.User.id}-${aid}-${pid||""}`).then(v=>{
        if(!!v){
            console.debug("检测到", aid, pid, v)
            delete v.id
            Object.assign(option, v)
        }

        ok({url, option})
    })
})

/**
 * @param {String} aid
 * @param {String} pid
 * @param {Object} ps
 * @param {String} params
 */
const openAppOrPage = (aid, pid, ps={}, params)=> prepare(aid, pid, params).then(({ url, option })=> openUrl(url, Object.assign(ps, option)))

/**
 * 运行应用，默认以新窗口打开（不判断应用预设的属性，如窗口大小）
 * @param {*} id
 * @returns
 */
export const run=(id)=> runPage(id, null, true)

/**
 * 运行页面
 * @param {*} aid
 * @param {*} pid
 * @param {*} blank     是否在新页面打开（新窗口）
 * @param {*} params    参数（通过 URL 传递）
 */
export const runPage=(aid, pid, blank=false, params)=>{
    if(blank===true){
        //此处读取本地的窗口大小
        openAppOrPage(aid, pid, {}, params)
    }
    else
        location.href = url
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

                openAppOrPage(app.id, undefined, { title:app.name, width, height, center: !property.winMax })
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

/**
 * 获取用户清单
 * @param {String} id 若不为空则返回模糊匹配的结果
 */
export const users = (id)=> withPost(`/account/users`,{key:id})
/**
 * 获取部门清单
 */
export const departments = ()=>withPost(`/account/departs`)

/**
 * 获取角色列表
 */
export const roles = ()=> withPost(`/account/roles`)
