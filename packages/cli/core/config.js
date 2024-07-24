export const config = {
    host: {
        value: "http://localhost:10086/app-meta",
        required: true,
        summary:"平台后端地址（http 开头，并注意 context-path）",
        check: v=> /^https?:\/\/.*/.test(v)
    },
    uid: {
        summary: "您的用户ID"
    },
    secret: {
        summary: "自动登录用到的密钥（从管理员处获取，长度 16）",
        check: v=> /^[A-Za-z0-9]{16}$/.test(v)
    },
    header: {
        value: "MUA",
        summary: "请求头中授权 TOKEN 的参数名称"
    }
}

/**
 *
 * @param {*} name
 * @param {*} v
 */
export const checkConfigValue = (name, value)=>{
    let c = config[name] ?? {}
    if(!(typeof(c.check) == 'function'? c.check(value) : RegExp(c.check).test(value)))
        throw Error(`配置项 ${name} 格式检验不通过：${c.summary} `)
}
