import { basename, extname } from 'path'
import { createReadStream } from 'fs'

import { Command, Argument, Option } from 'commander'
import confirm from '@inquirer/confirm'
import FormData from 'form-data'

import { appName, optionOfId, optionOfKey, optionOfName } from '../core/base.js'
import { buildTableRows, callServer, isFile, printOK, printObj, printObjects, printTable, sleep, startLoading, stopLoading } from '../core/util.js'
import chalk from 'chalk'

const N         = "平台后端"
const UI        = "ui"
const JAR       = "jar"
const CLIENT    = "client"

const restart = async (times=6)=>{
    let answer = await confirm({
        message: "确定要自重启后台服务吗？",
        default: false
    })
    if(answer != true)  return

    startLoading({text:`${N}自重启中...`, color:'red'})

    try{
        await callServer("/system/restart")
        stopLoading('重启指令发送成功')
    }
    catch(e){
        stopLoading(e.message, false)
        return
    }

    startLoading({text:`等待 ${times} 秒后检测服务可用性...`, color:'cyan', spinner:'earth'})
    await sleep(times * 1000)
    // 尝试获取日期
    let res = await callServer("/time", {}, true, false, {retry:{limit: 2}})
    if(res.data)
        stopLoading(`${N}重启完成，${res.data}`)
    else
        stopLoading(`无法判断服务可用性，请稍后再试`, false)
}

/**
 *
 * @param {String} type
 * @param {Object} ps
 * @param {String} ps.file - 待上传文件路径
 * @param {*} cmd
 */
const update = async (type, ps)=>{
    if(!isFile(ps.file))    throw `${ps.file} 不是一个有效的文件`

    let ext = extname(ps.file).toLowerCase()
    if(type == JAR && ext != `.${JAR}`)
        throw `请选择 JAR 文件`
    else if(type == UI && ext != `.zip`)
        throw `请选择 ZIP 文件`
    else if(type == CLIENT && !['.zip', '.7z'].includes(ext))
        throw `更新客户端程序包仅限 7z 或者 zip 格式`

    let name = basename(ps.file)

    const answer = await confirm({ message: `确定上传 ${name} 到${N}（类型=${type}）吗？`, default: false })
    if(answer != true)  return

    startLoading((type == UI ? `UI 文件更新中`:`JAR 上传并自动重启刷新（大概需要 30 秒，若出现链接中断请稍后通过 ${chalk.magenta(`${appName} info`)} 检测）`)+"，请耐心等待...")

    let body = new FormData()
    body.append('file', createReadStream(ps.file))

    let res = await callServer(
        type==UI?"/app/version/upload": `/system/update-${type.toLowerCase()}`,
        body,
        2
    )

    stopLoading(`${type} 更新完成`)
    if(res.data)
        console.info(`${res.data}`.replace(/<br>/g, "\n"))
}

const downloadLog = async ()=>{
    await callServer('/system/log', {}, 0, true, {}, "meta-log.log")
}

const downloadVerLog = async ()=> printObjects(await callServer("/system/log-version", {size:30}))

export default (app=new Command())=> {
    const sys = app.command("system")
        .alias("sys")
        .description("管理员/平台级别功能")

    sys.command("restart")
        .description("自重启应用（适用于修改配置/参数后热加载）")
        .option('-t, --time [number]', "重启等待时长（单位秒）", 10)
        .action(restart)

    sys.command("update")
        .description("更新后端资源，通过 -t/--type 设置类别（ui=前端资源，jar=后端程序包，client=客户端程序全量/增量包）")
        .addArgument(new Argument('[type]', "更新类型").default("ui").choices([UI, JAR, CLIENT]))
        .requiredOption('-f, --file [string]', "文件路径")
        .action(update)

    sys.command("log")
        .description(`获取平台运行时日志`)
        .action(downloadLog)

    sys.command("log-version")
        .description(`获取平台后端存储的更新记录（通常为调用 system update 命令）`)
        .action(downloadVerLog)

    const cache = sys.command("cache")
        .description(`系统缓存（后端）管理`)
        .action(async ()=> printObjects(await callServer("/system/cache/list")) )

    cache.command("clean")
        .description(`清空指定缓存（使用 -k, --key 指定名称，多个用英文逗号隔开）`)
        .option(...optionOfKey)
        .option(...optionOfId)
        .action(async ps=>{
            const answer = await confirm({ message: `确定清空 ${ps.key} 的缓存（ID=${ps.id||'不限'}）吗？`, default: false })
            if(answer != true)  return

            await callServer('/system/cache/clean', ps)
            printOK()
        })

    const account =  sys.command("account [id]")
        .description("用户管理")
        .action(async id=>{
            let res = await callServer("/system/account/detail", {id})
            printObj(`用户 ${id} 的信息`, res.data)
        })

    account.command("update-role")
        .description(`
        更新指定用户的角色权限
        ① 添加角色 ${appName} sys account update-role -t add -u admin -r TEST
        ② 删除角色 ${appName} sys account update-role -t remove -u admin -r TEST
        ③ 设置角色 ${appName} sys account update-role -t set -u admin -r TEST
        `)
        .addOption(new Option('-t, --type [string]').default("set").choices(['add', 'remove', 'set']))
        .requiredOption('-u, --uid <string>', "用户ID")
        .requiredOption('-r, --role <string>', "角色值或ID")
        .action(async (ps)=>{
            if(ps.type != "set" && !ps.role)
                throw `角色 --role 不能为空`

            await callServer("/system/account/update-role", {id: ps.uid, key:ps.type, value:ps.role})
            printOK(`${ps.uid} 角色更新完成`)
        })

    sys.command("roles").description("列出平台的全部角色").action(async ()=>{
        let res = await callServer("/account/roles", {})
        let header = ["id","name","summary"]
        printTable(buildTableRows(res.data, header), header)
        // let o = {}
        // res.data.forEach(d=> o[d.id] = `${chalk.magenta(d.name)} ${d.summary}`)
        // printObj(`角色清单（共 ${res.data.length} 个）`, o)
    })
}
