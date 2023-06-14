import { Command } from 'commander'
import { createWriteStream } from 'fs'
import chalk from 'chalk'

import { callServer, printTable, startLoading, stopLoading } from '../core/util.js'
import { optionOfAid, optionOfOutput, optionOfPid } from '../core/base.js'

const query = async ps=>{
    if(!ps.aid)                                 throw `请通过 -a,--aid 指定应用ID`
    // if(!ps.pid)                                 throw `请通过 -p,--pid 指定页面ID`
    if(isNaN(ps.pageSize) || ps.pageSize<=0)    throw `pageSize 值无效`
    if(isNaN(ps.page) || ps.page<0)             throw `page 页码值无效`

    startLoading(`查询应用 ${ps.aid}/${ps.pid} 的业务数据...`)
    let res = await callServer("/data/query", ps)
    let datas = ps.all? res.data : res.data.map(d=>d.v)
    stopLoading(`数据查询完成，耗时 ${res.used} 秒，本次返回数据量 ${datas.length} 条`)
    if(datas.length == 0)   return

    if(ps.output){
        let fw = createWriteStream(ps.output, {encoding:'utf-8'})
        fw.write("[\n")
        for (let i = 0; i < datas.length; i++) {
            const d = datas[i]
            fw.write("    "+JSON.stringify(d))
            if(i< datas.length - 1)
                fw.write(",")
        }
        fw.write("\n]")
        fw.close()
        console.log(`数据写入到 ${chalk.magenta(ps.output)}`)
    }
    else
        console.log(datas)
}

export default (app=new Command())=> {
    const data = app.command('data').alias('d')
        .description(`应用数据的CURD`)

    data.command("query").alias("r").alias("q")
        .description(`查询数据（可通过 -o, --output 指定输出到文件）`)
        .option('--page <number>', "页码，默认为 0", 0)
        .option('-s, --pageSize <number>', "每页数据量，默认 20", 20)
        .option('-m, --match <object>', "查询条件")
        .option('--all', '是否显示完整的信息（包含 UID、录入时间等）', false)
        .option(...optionOfOutput)
        .option(...optionOfAid)
        .option(...optionOfPid)
        .action(query)
}
