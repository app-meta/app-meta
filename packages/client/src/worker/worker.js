const os = require('os')
const { isDev, verbose, appPath } = require("../Runtime")
const logger = require("../common/logger")

const Robot = require('../sdk/module/robot')
// const { runRobot, repairAndCheck } = require("../core/RobotManage")
const { decrypt } = require("../service/rsa")

/**
 * @typedef {Object} WorkerTask
 * @property {String} method - 方法名称
 * @property {Object} params - 参数
 * @property {Number} time - 时间戳，要求不超过 60 秒
 */

/**
 * @type {import("fastify").FastifyInstance}
 */
let worker = undefined

/** @type {Number} - 工作者启动时间戳*/
let startOn= 0
/** @type {Number} - 任务执行总数 */
let taskCount = 0

const prefix = "[WORKER]"

const done = (data, message)=> ({data, message, success: true})
const error = (e, data)=> ({data, message: typeof(e)=='string'?e:e.message, success:false})

const handlers = {
    /**
     * @param {Object} params
     * @returns
     */
    'status': ()=> new Promise((ok, fail)=>{
        ok({
            startOn,
            taskCount,
            path: appPath,
            os: {
                platform: os.platform(),
                version: os.version(),
                totalMem: os.totalmem(),
                freeMem: os.freemem()
            }
        })
    }),
    /**
     * @param {String} taskId
     * @param {Object} ps
     * @returns
     */
    'start' : (taskId, ps)=> new Promise((ok, fail)=>{
        verbose && logger.info(`${prefix} 尝试执行机器人#${ps.id}，参数 ${JSON.stringify(ps.params)}`)
        try{
            Robot.run(ps.id, ps.params, {link: taskId})
                .then(()=>{
                    taskCount ++
                    ok()
                })
                .catch(e=>fail(e))
        }catch(e){
            fail(e)
        }

        // try{
        //     ps = repairAndCheck(ps)
        // }
        // catch(e){
        //     return fail(e)
        // }
        // runRobot(ps)
        // ok(``)

    }),
    /**
     * @returns
     */
    'stop'  : ()=> new Promise((ok, fail)=>{
        throw Error(`暂不支持停止操作`)
    })
}

/**
 * 启动工作者模式
 *
 * @param {Object} param
 * @param {Number} param.port - 服务端口，默认9900
 * @param {String} param.dataKey - 密钥
 */
exports.launch = ({port = 9900, dataKey=""}={})=>{
    if(!dataKey) throw `启动工作者模式的密钥不能为空`

    logger.info(`${prefix} 尝试启动工作者模式（端口=${port}）`)
    worker = require('fastify')({logger:false})

    /*
    * ==================== 添加统一异常处理 ====================
    */
    worker.setNotFoundHandler((req, res)=> res.status(404).send(error(`${req.url} NOT FOUND`)))
    worker.setErrorHandler((e, req, res)=>{
        logger.error(`${prefix} `, e)
        res.status(500).send(error(typeof(e)=='string'?e:e.message))
    })

    worker.route({
        url:"/",
        method: isDev?['GET','POST']:['POST'] ,
        handler: (req, res)=> {
            if(!req.body) throw Error(`指令不能为空`)

            let jsonStr = decrypt(req.body, dataKey)
            if(/^\{.*\}$/.test(jsonStr)){
                /**
                 * @type {WorkerTask}
                 */
                let task = JSON.parse(jsonStr)
                verbose && logger.info(`接收指令：ID=${task.id} METHOD=${task.method} TIME=${task.time}`)
                if((Date.now() - task.time) >= 60*1000) throw Error(`指令时效已过`)

                if(task.method in handlers){
                    handlers[task.method](task.id, task.params).then(d=> res.send(done(d))).catch(e=>{
                        logger.error(`${prefix} 处理报错[method=${task.method}]`, e)
                        res.send(error(e))
                    })
                }
                else
                    throw Error(`无效的指令`)
            }
            else
                throw Error(`无效的指令`)
        }
    })

    worker.listen({port}, err=>{
        if (err) {
            logger.error(`${prefix} 启动失败`, err)
        }
        else{
            startOn = Date.now()
            logger.info(`${prefix} 启动完成 ^.^`)
        }
    })
}

/**
 * 停止工作者模式
 */
exports.stop = ()=>{
    if(worker != null){
        worker.close()
    }
}
