const { isDev } = require("../../Runtime")
const logger = require("../../common/logger")
const { runRobot, repairAndCheck } = require("../../core/RobotManage")
const { callServer } = require("../../service/Http")

module.exports ={
    /**
     * 启动指定的机器人
     * @param {Number|String|Object} idOrObj - 机器人ID或者对象
     * @param {Object} params - 运行时参数
     * @param {RobotContext} config
     */
    run: async (id, params={}, config) => {
        config = Object.assign({link:undefined, hideWindow: false, reportLaunch:true}, config)
        logger.debug(`尝试启动机器人 #${id} 环境=${JSON.stringify(config)}`)

        let { data } = await callServer("/page/detail", {id})
        if(data == null)    throw `无法获取机器人 #${id} 的信息（可能未启用或已被移除，请联系管理员）`

        let { aid, content, name } = data
        if(isDev)   logger.debug("获取 ROBOT 信息", data)

        if(data.template!='robot')  throw Error(`#${id} ⌈${name}⌋ 不是一个有效的机器人（TEMPLATE = ${data.template}）`)
        if(data.active != true)     throw Error(`网页机器人 #${id} ⌈${name}⌋ 未启用，请联系创建者`)
        if(!content)                throw Error(`网页机器人 #${id} ⌈${name}⌋ 未初始化或未授权`)

        runRobot(
            repairAndCheck({
                page: { id, aid , name },
                bean: JSON.parse(content),
                params
            }),
            config
        )
    }
}
