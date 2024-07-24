import { Command } from 'commander'
import chalk from 'chalk'

import { getItem, setItem } from '../core/stroe.js'
import { loadConfig, callServer, printObj, clearToken, printTable } from '../core/util.js'
import { checkConfigValue, config } from '../core/config.js'

export default (app=new Command())=> {
    app.command("info")
        .description("显示相关信息并检测本地与服务器的联通性（返回服务器时间）")
        .action(async (ps, cmd)=>{
            let config = loadConfig(false)
            //打印信息，banner 来自 http://patorjk.com/software/taag（字体 Modular）
            console.log(`
 _______  _______  _______    __   __  _______  _______  _______    _______  ___      ___
|   _   ||       ||       |  |  |_|  ||       ||       ||   _   |  |       ||   |    |   |
|  |_|  ||    _  ||    _  |  |       ||    ___||_     _||  |_|  |  |       ||   |    |   |
|       ||   |_| ||   |_| |  |       ||   |___   |   |  |       |  |       ||   |    |   |
|       ||    ___||    ___|  |       ||    ___|  |   |  |       |  |      _||   |___ |   |
|   _   ||   |    |   |      | ||_|| ||   |___   |   |  |   _   |  |     |_ |       ||   |
|__| |__||___|    |___|      |_|   |_||_______|  |___|  |__| |__|  |_______||_______||___|
`)
            console.log(`欢迎使用 APP-META CLI 工具（VER=${cmd.parent._version}）`)
            console.log(`使用前请通过 ${chalk.cyan("meta config host {地址}")} 命令设置后台地址`)

            console.log('-----------------------------------------------------')
            // printObj("客户端配置信息", config)
            printTable(config, "客户端配置信息")

            let time
            try{
                let res = await callServer("/time", {}, true, false)
                time = res.data
            }
            catch(e){
                time = chalk.red(e)
            }

            console.log('-----------------------------------------------------')
            // console.log()
            console.log(`${chalk.bgMagenta("服务器时间")} ${time}`)
        })

    app.command("config <name> [value]")
        .description("设置或获取配置项")
        .action((name, value, cmd)=>{
            let n = (name ?? "").toLowerCase()
            if(!config[n])  return console.error(chalk.red(`未知配置项 ${n}（目前支持： ${Object.keys(config).join("、")}）`))

            if(value != undefined){
                checkConfigValue(n, value)
                setItem(n, value)

                if(n == 'secret')   clearToken()
            }
            else
                console.log(`配置项 ${n} = ${getItem(n)}`)
        })

    app.command("whoami [id]")
        .description("获取或者设置用户ID")
        .action((ps, cmd)=> {
            let uid = "uid"
            if(ps){
                setItem(uid, ps)
                console.log(`用户 ID 设置为 ${chalk.cyan(ps)}`)
            }
            else
                console.debug(`当前用户 ID 为`, getItem(uid))
        })
}
