function buildFuncBody(body, usePromise=true){
    return usePromise?
        `return new Promise((resolve, reject)=>{
            ${body}
        })`
        :
        body
}

export const runApp = appOrId=> {
    H.app.loadAndRun(appOrId)
        .then(app=>M.ok(`应用「${app.name}」已启动`))
        .catch(e=> M.dialog({type:"error", title:"应用启动失败", content:e}))
}

export const runPage = p =>{
    if(p.template == 'robot')   return H.app.runRobot(p.pid || p.id)

    //打开方式：设置 OPEN_BLANK 为 true 则是新窗口，否则：首页时新开标签页
    H.app.runPage(p.aid, p.pid || p.id, window.OPEN_BLANK==true?true: location.hash.startsWith("#/home")?1:0)
}

/**
 * 执行代码
 * @param {*} body
 * @param {*} params
 * @returns
 */
export const runScript = (body, params={}, promise=false)=>{
    try{
        let paramsNames = Object.keys(params)
        return new Function(...paramsNames, buildFuncBody(body, promise))(...paramsNames.map(v=>params[v]))
    }
    catch(e){
        console.error("执行代码出错", e)
        UI.showError(e)
    }
}
