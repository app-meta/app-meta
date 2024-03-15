import { gunzipSync } from 'zlib'

import { Command } from 'commander'

import { callServer, printObj, printTable, startLoading, stopLoading, tryLoadFile } from '../core/util.js'
import { optionOfAid, optionOfFile, optionOfUid } from '../core/base.js'
import chalk from 'chalk'

const toJSON = text=> text? JSON.parse(text):{}

const showDetail = async idOrPs=>{
    let isId = typeof(idOrPs)==='string'
    if(isId && isNaN(idOrPs))   throw `参数 ID 必须为有效的数字`

    if(!isId)   console.debug(`查询条件：`, idOrPs)
    let res = await callServer('/page/terminal/trace/'+(isId?idOrPs:`last`), isId?null:idOrPs)
    if(res.data == null)    throw `服务器返回空，请检查参数`

    let { log, detail } = res.data

    if(log){
        log.addOn   = new Date(log.addOn).toLocaleString()
        log.used    = `${log.used} 毫秒`
    }
    console.log(chalk.magenta('---------------------------- 请求总览 ----------------------------'))
    printTable(log)
    console.log(chalk.magenta('---------------------------- 详细信息 ----------------------------'))
    if(detail){
        let SPLIT = "\n"
        let reqHeader = toJSON(detail.reqHeader)
        printObj(`请求头/REQUEST HEADER`, reqHeader, 30)

        let isForm = reqHeader['content-type']=='application/x-www-form-urlencoded'
        printObj(`${SPLIT}请求体/REQUEST BODY`, isForm? decodeURIComponent(detail.reqBody) : detail.reqBody)

        let resHeader = toJSON(detail.resHeader)
        printObj(`${SPLIT}响应头/RESPONSE HEADER`, resHeader, 30)
        // printObj(`${SPLIT}响应体/RESPONSE BODY`, detail.resBody)

        //判断是否为 GZIP 返回内容
        if(resHeader['Content-Encoding']=='gzip' || resHeader['content-encoding']=='gzip'){
            printObj(
                `${SPLIT}检测到响应为 GZIP 编码，尝试还原`,
                gunzipSync(Buffer.from(detail.resBody, 'base64')).toString('utf-8')
            )
        }
        else{
            printObj(`${SPLIT}解码响应内容（BASE64）`, Buffer.from(detail.resBody, 'base64').toString('utf-8'))
        }
    }
    else
        console.log(chalk.gray(`无详细信息，请检查是否开启持久化详情选项`))
}

export default (app=new Command())=> {
    const service = app.command("service <id>")
        .description(`调用后端服务（template=server）`)
        .option(...optionOfFile)
        .option('-u, --url <string>', "服务URL（相对地址）")
        .option('-p, --params <string>', "JSON 字符串格式的参数")
        .option('-g, --get', "是否使用 GET 方式（默认为 POST）")
        .option('--form', "使用传统表单方式提交参数（此时 METHOD 限定为 POST）")
        .action(async (id, ps)=>{
            if(!ps.url) throw `请通过 -u,--url 指定URL`
            if(!ps.url.startsWith("/"))  ps.url = `/${ps.url}`

            let params = ps.params || (ps.file? tryLoadFile(ps.file) : "{}")
            startLoading(`请求 ID=${id} 的后端服务 ${ps.url} (METHOD=${ps.get===true?'GET':'POST'})`)

            let res = await callServer(`/service/${id}${ps.url}`, JSON.parse(params), ps.form===true? 1: ps.get===true?3:0)

            stopLoading()
            console.debug(res)
        })

    service.command("log [id]")
        .description(`查看指定 ID 请求的详细信息`)
        .action(showDetail)

    service.command("last")
        .description(`显示最新的一条请求信息，可通过 -a/--aid，-u/--uid，-c/--channel，--ip 筛选`)
        .option('-c, --channel <string>', "终端类型，可选值：browser（浏览器）、client（客户端）、mobile（移动端）、cli（命令行工具）")
        .option('--ip <string>', "IP地址")
        .option('--path <string>',"服务地址")
        .option(...optionOfUid)
        .option(...optionOfAid)
        .action(showDetail)
}
