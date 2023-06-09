import { Command } from 'commander'
import chalk from 'chalk'

import { callServer, printTable } from '../core/util.js'

export default (app=new Command())=> {
    app.command("query <keyword>")
        .alias("q")
        .description("检索应用或者页面")
        .action(async text=>{
            let started = Date.now()

            let res = await callServer("/query", {text})
            let items = res.data
            let used = ((Date.now() - started)/1000).toFixed(3)
            let cols = ["aid","pid","uid","launch","name"]
            printTable(
                items.map(i=>cols.map(c=>c!='name'?i[c]: i[c].replaceAll(text, chalk.magenta(text)))),
                cols
            )

            console.log(`\n查询关键字⌈${text}⌋，共找到 ${items.length} 条记录，耗时 ${used} ms`)
        })
}
