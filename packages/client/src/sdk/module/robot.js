const { isDev } = require("../../Runtime")
const logger = require("../../common/logger")
const { runRobot, repairAndCheck } = require("../../core/RobotManage")
const { callServer } = require("../../service/Http")

module.exports ={
    /**
     * 启动指定的机器人
     * @param {*} idOrObj
     * @returns
     */
    "run": async (id, params={}) => {
        logger.debug(`尝试启动机器人 #${id}`)
        let { data } = await callServer("/page/detail", {id})
        let { aid, content, name } = data
        if(isDev)   logger.debug("获取 ROBOT 信息", data)

        if(data.template!='robot')  throw Error(`#${id} ⌈${name}⌋ 不是一个有效的机器人（TEMPLATE = ${data.template}）`)
        if(data.active != true)     throw Error(`网页机器人 #${id} ⌈${name}⌋ 未启用，请联系创建者`)
        if(!content)                throw Error(`网页机器人 #${id} ⌈${name}⌋ 未初始化`)

        runRobot(
            repairAndCheck({
                page: { id, aid , name },
                bean: JSON.parse(content),
                params
            })
        )
    }
}
