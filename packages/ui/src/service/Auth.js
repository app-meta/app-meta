/*
 * @Author: 集成显卡
 * @Date: 2022-11-02 13:34:30
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-03-29 13:34:34
 */

export function checkRole(requireRole) {
    let roles = window.User ? (User.roles || []) : []
    return typeof (requireRole) === 'string' ? roles.includes(requireRole) : requireRole(roles)
}

export const hasAnyRole = (...items)=>{
    let roles = window.User ? (User.roles || []) : []
    return roles.some(r=> items.includes(r))
}

export const hasAllRole = (...items)=>{
    let roles = window.User ? (User.roles || []) : []
    return items.every(r=> roles.includes(r))
}

/**
 * 尝试跳转到 CAS 登录，使用方式：
 *
 * tryLoginWithCAS() && { 其他操作 }
 * @returns 返回 true 时为无需 CAS 登录
 */
export const tryLoginWithCAS = fromUrl =>{
    localStorage.setItem("LOGIN-REDIRECT", fromUrl)

    if(Config.auth_method === 'CAS'){
        // 构建32位长度并以 META 开头的 token
        let token = "META"+H.secret.md5(`${Date.now()}${Math.random()}`).substring(4)
        localStorage.setItem("CAS-TOKEN", token)
        window.location.href = `${window.SERVER}/login_with_cas?token=${token}`

        return false
    }
    return true
}
