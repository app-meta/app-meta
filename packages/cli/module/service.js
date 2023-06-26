import { Command } from 'commander'

import { callServer, printObjects, startLoading, stopLoading, tryLoadFile } from '../core/util.js'
import { optionOfFile, optionOfId, optionOfName, optionOfPid } from '../core/base.js'

export default (app=new Command())=> {
    const api = app.command("service <id>")
        .description(`调用后端服务（template=server）`)
        .option(...optionOfFile)
        .option('-u, --url <string>', "服务URL（相对地址）")
        .option('-p, --params <string>', "JSON 字符串格式的参数")
        .option('-g, --get', "是否使用 GET 方式（默认为 POST）")
        .action(async (id, ps)=>{
            if(!ps.url) throw `请通过 -u,--url 指定URL`
            if(!ps.url.startsWith("/"))  ps.url = `/${ps.url}`

            startLoading(`请求 ID=${id} 的后端服务 ${ps.url} (METHOD=${ps.get===true?'GET':'POST'})`)

            let params = ps.params || (ps.file? tryLoadFile(ps.file) : "{}")
            let res = await callServer(`/service/${id}${ps.url}`, JSON.parse(params), ps.get===true?3:0)

            stopLoading()
            console.debug(res)
        })
}
