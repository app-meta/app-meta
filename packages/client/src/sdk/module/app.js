const { loadAndStart } = require("../../core/App")
const { setToken, getToken } = require("../../service/Http")

module.exports ={
    /**
     * 启动应用
     * @param {*} idOrObj
     * @returns
     */
    "start": idOrObj => loadAndStart(idOrObj),

    /**
     * 设置或者获取用户 token
     * @param {*} token
     * @returns
     */
    "token": token => token? setToken(token):getToken()
}
