import { Command } from 'commander'
import chalk from 'chalk'
import confirm from '@inquirer/confirm'
import checkbox from '@inquirer/checkbox'

import { needAid, optionOfAid, optionOfId, optionOfUid, optionOfValue } from '../core/base.js'
import { buildTableRows, callServer, printFail, printOK, printTable } from '../core/util.js'
import { inputToObject, required } from '../core/prompt.js'

const roleList = async ps=>{
    needAid(ps)
    let res = await callServer("/app/role/list", ps)
    if(!!ps.uid){
        if(res.data == null)    return console.info(`用户 <${ps.uid}> 未分配角色`)

        console.info(`${chalk.magenta(`用户分配角色情况：`)}`)
        printTable(res.data)
    }
    else{
        let header = ["uuid","name", "auth", "summary"]
        printTable(buildTableRows(res.data, header), header)
        console.debug(`\n应用 <${ps.aid}> 共 ${chalk.magenta(res.data.length)} 个角色`)
    }
}

const roleCreate = async ps=>{
    let role = await inputToObject([
        { msg:`应用ID`, key:"aid", required },
        { msg:`角色ID（数字、字母、下划线、英文点）`, key:"uuid", required, validate: s=>/^[0-9a-zA-Z_.]+$/.test(s) },
        { msg:`角色中文名`, key:"name" },
        { msg:`授权访问地址（请以/开头，多个用英文逗号隔开）`, key:'auth', required },
        { msg:`描述信息`, key:"summary" }
    ])
    await callServer(`/app/role/add`, role)
    printOK("应用角色创建完成")
}

const roleDel = async ps=>{
    needAid(ps)
    if(await confirm({ message: `确定删除应用<${ps.aid}>下的角色<${ps.id}吗？` })){
        let res = await callServer(`/app/role/delete`, {aid: ps.aid, uuid: ps.id})
        if(res.data>0)
            printOK(`应用角色<${ps.id}>已删除`)
        else
            printFail(`无数据受影响，请检查参数`)
    }
}

const roleLink = async ps=>{
    let link = { aid:ps.aid, uid:ps.uid }
    if(!!ps.value){
        link.role = ps.value
    }
    else{
        let res = await callServer(`/app/role/list`, { aid: ps.aid })
        if(res.data.length == 0)    return printFail(`应用<${ps.aid}>还未创建角色`)

        let roles = await checkbox({message:`请选择需要分配的角色`, choices: res.data.map(r=>({value:r.uuid, name:`${r.name}：${r.summary||chalk.gray(`暂无描述`)}`}))})
        link.role = roles.join(",")
    }

    if(await confirm({message:`即将分配角色<${link.role}>给用户<${ps.uid}>，确定吗？`})){
        await callServer(`/app/role/link`, link)
        printOK(`角色分配完成`)
    }
}

export default (root=new Command())=> {
    const app = root.command("app")
        // .alias("a")
        .description(`应用（${chalk.magenta("角色、权限")}等）管理`)

    const role = app.command("role")
        .alias("r")
        .description(`应用角色相关操作（通过 list 命令可显示指定应用下的${chalk.magenta("全部角色")}）`)

    role.command("list").alias("l")
        .description(`显示由于下全部的角色（增加 -u,--uid 可筛选指定用户的角色）`)
        .requiredOption(...optionOfAid)
        .option(...optionOfUid)
        .action(roleList)

    role.command("add")
        .description(`新增角色（角色唯一编号 uuid 一旦创建无法修改，请慎重操作）`)
        .action(roleCreate)

    role.command("del")
        .description(`删除指定的应用角色`)
        .requiredOption(...optionOfAid)
        .requiredOption(...optionOfId)
        .action(roleDel)

    role.command("link")
        .description(`关联用户到指定的角色，可通过 -v, --value 指定内容或通过复选框选择（需要先录入角色）`)
        .requiredOption(...optionOfAid)
        .requiredOption(...optionOfUid)
        .option(...optionOfValue)
        .action(roleLink)

    role.command("check")
        .description(`检测用户是否具备访问执行 url（通过 -v, --value 指定） 的权限`)
        .requiredOption(...optionOfAid)
        .requiredOption(...optionOfUid)
        .requiredOption(...optionOfValue)
        .action(async ps=>{
            let res = await callServer(`/app/role/check`, {aid:ps.aid, uid:ps.uid, role:ps.value})
            console.info(`访问权限检测：${res.data}`)
        })

    role.command("clean-cache")
        .description(`删除应用授权缓存（修改或分配角色后不生效可尝试此法）`)
        .requiredOption(...optionOfAid)
        .action(async ps=>await callServer(`/app/role/clean-cache`, {aid:ps.aid}))
}
