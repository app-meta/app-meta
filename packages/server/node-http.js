/**
 * 使用标准 node 模块实现的简单 HTTP Server（适合无第三方依赖的应用）
 * 进处理 application/json 格式的请求
 */
const { existsSync, statSync, readFileSync } = require('fs')
const { createServer } = require('http')

console.debug("参数", process.argv)

const configFile = "config.json"
const config = { port: 8080 }
if(existsSync(configFile) && statSync(configFile).isFile()){
    Object.assign(config, JSON.parse(readFileSync(configFile, { encoding: 'utf-8' })))
    console.debug(`从${configFile}中读取配置文件`, config)
}

const ok = (data, message)=> ({data, message, success: true})
const error = (message, data)=> ({data, message, success:false})

const doAction = (req, res)=> new Promise((resolve, reject)=>{
    let { url, body } = req
    if(url=='/add'){
        if(Array.isArray(body)){
            console.debug("[ADD] 求和", body)
            let sum = 0
            body.forEach(v=> sum += isNaN(v)? 0 : Number(v))
            resolve(ok(sum, `参数：${body}`))
        }
        else
            reject(`参数必须是数组格式`)
    }

    reject(`未知服务 ${url}`)
})

const server = createServer((req, res)=>{
    res.writeHead(200, { 'content-type': 'text/json;charset=utf8' })

    var buffers = []
    req.on('data', chunk=>buffers.push(chunk))
    req.on('end', ()=> {
        req.rawBody = Buffer.concat(buffers).toString()
        if ((req.headers['content-type']||"").toLowerCase().indexOf('application/json')==0) {
            try{
                req.body = JSON.parse(req.rawBody)
            }catch(e){
                return res.end(JSON.stringify(error(`无效的JSON格式：${e.message}`)))
            }
        }

        doAction(req, res)
            .then(d=> res.end(JSON.stringify(d)) )
            .catch(e=>{
                console.group(`处理 ${req.url} 出错`)
                console.error(e)
                console.groupEnd()
                res.end(JSON.stringify(error(typeof(e)==='string'? e : e.message)))
            })
    })
})

server.listen(config.port)
console.info(`Server startup ok, listen on ${config.port}...`)
