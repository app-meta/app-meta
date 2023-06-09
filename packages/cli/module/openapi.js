import { Command } from 'commander'
import confirm from '@inquirer/confirm'
import chalk from 'chalk'

import { callServer, printObjects, startLoading, tryLoadFile } from '../core/util.js'
import { optionOfFile, optionOfId, optionOfName, optionOfPid } from '../core/base.js'
import { printOK } from '../core/util.js'

const query = async ps=>{
    let form = {}
    if(ps.id)   form.EQ_id = ps.id
    if(ps.pid)  form.EQ_pid = ps.pid
    if(ps.name) form.LIKE_name = ps.name

    startLoading(`接口查询, 参数=${JSON.stringify(form)}`)
    let res = await callServer("/api/query", { form })

    printObjects(res)
}

const callApi = async (id, opt)=>{
    if(isNaN(id))   throw `${id} 不是一个有效的接口编号`

    let ps = {}
    if(opt.params)
        ps = JSON.parse(opt.params)
    else if(opt.file)
        ps = JSON.parse(tryLoadFile(opt.file))

    console.log(`调用开放接口 ${chalk.magenta("#"+id)}，参数=`, ps)

    let res = await callServer(`/api/${id}`, ps)
    printObjects(res)
}

const editApi = async ps=>{
    if(!ps.name)                            throw `接口名称不能为空（通过 -n, --name 指定）`
    if(ps.pid != null && isNaN(ps.pid))     throw `父接口ID限定为数值`

    let res = await callServer("/system/api/edit", ps)
    printOK(`接口更新完成，返回 ID=${res.data}`)
}

export default (app=new Command())=> {
    const api = app.command("api [id]")
        .description(`调用开放接口`)
        .option(...optionOfFile)
        .option('-p, --params <string>', "JSON 字符串格式的参数")
        .action(callApi)

    api.command("query").alias("q")
        .description(`查询接口（默认显示全部接口）`)
        .option(...optionOfPid)
        .option(...optionOfName)
        .option(...optionOfId)
        .action(query)

    api.command("add")
        .description(`新增或编辑（给定 -i, --id）开放数据接口`)
        .option(...optionOfId)
        .option(...optionOfPid)
        .option(...optionOfName)
        .action(editApi)

    api.command("del <id>")
        .description(`删除开放数据接口`)
        .action(async id=>{
            if(isNaN(id))   throw `${id} 不是一个有效的接口编号`

            const answer = await confirm({ message: `确定删除接口 #${id} 吗？`, default: false })
            if(answer != true)  return

            await callServer("/system/api/delete", {id})
        })
}
