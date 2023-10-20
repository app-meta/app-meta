const { app } = require("electron")
const schedule = require('node-schedule')
const { stop, launch } = require("./worker")
const { worker } = require("../Config")
const { verbose } = require("../Runtime")
const logger = require("../common/logger")
const { loadTokenFromServer } = require("../service/Http")

app.on('before-quit', stop)

/**
 * @type {schedule.Job}
 */
let refreshTokenJob

/**
 * 初始化工作者环境
 * @returns {Promise}
 */
exports.launchWorker = ()=> new Promise((ok, fail)=>{
    loadTokenFromServer(worker.tokenKey, worker.uid)
        .then(()=>{
            launch(worker)
            //开启定时器，每隔12小时更新一次token
            refreshTokenJob = schedule.scheduleJob("0 0 */12 * * ?", ()=>{
                loadTokenFromServer(worker.tokenKey, worker.uid)
                    .then(()=> verbose && logger.info(`TOKEN 刷新成功 ^.^`))
                    .catch(e=> logger.error(`TOKEN 刷新失败`, e))
            })

            ok()
        })
        .catch(fail)
})
