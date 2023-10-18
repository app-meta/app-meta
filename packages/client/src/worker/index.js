const { app } = require("electron")
const { stop, launch } = require("./worker")
const { worker } = require("../Config")

app.on('before-quit', stop)

/**
 * 初始化工作者环境
 * @returns {Promise}
 */
exports.launchWorker = ()=> new Promise(ok=>{
    launch(worker)
    ok()
})
