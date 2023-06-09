import { Command, Argument } from 'commander'

import { callServer, printOK, printObjects, tryLoadFile } from '../core/util.js'
import { optionOfFile, optionOfUid } from '../core/base.js'
import { toBase64 } from '@app-meta/basic'

export default (app=new Command())=> {
    const dbm = app.command("dbm").description(`数据源管理模块`)

    dbm.command("source")
        .description("列出")
        .action(async text=>{
            let res = await callServer("/dbm/source/list")
            printObjects(res.data, ['pwd'])
        })

    dbm.command("auth")
        .description("数据源授权管理")
        .addArgument(new Argument('[type]', "类型").default("list").choices(['list','add','delete']))
        .option('-n, --name <string>', "数据源名称")
        .option('-s, --sourceId <number>', "数据源ID")
        .option('-a, --allow <string>', "权限", "*")
        .option('--summary <string>', "备注信息")
        .option('-i, --id <number>', "授权ID")
        .option(...optionOfUid)
        .action(async (type, ps)=>{
            if(type=='list'){
                let res = await callServer("/dbm/auth/list")
                printObjects(res)
            }
            else if(type=='add') {
                await callServer("/dbm/auth/edit", ps)
                printOK()
            }
            else if(type == 'delete'){
                await callServer("/dbm/auth/delete", {id: ps.id})
                printOK(`编号#${ps.id}（若存在）的授权信息已被删除`)
            }
        })

    dbm.command("sql <sourceId> [code]")
        .description(`对指定数据源执行 SQL 语句（使用 -f,--file 可执行 SQL 文件）`)
        .option(...optionOfFile)
        .option('-d, --db <string>', "指定数据库名称")
        .action(async (sourceId, sql, ps)=>{
            let model = { sourceId, action:"SQL", db: ps.db }
            model.sql = toBase64(sql ?? tryLoadFile(ps.file))

            let res = await callServer("/dbm", model)
            printObjects(res)
        })
}
