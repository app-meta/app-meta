/**
 * 基于 fastify 框架的后端服务示例
 */


const { existsSync, statSync, readFileSync } = require('fs')
const configFile = "config.json"

const config = { port: 10000 }
if(existsSync(configFile) && statSync(configFile).isFile()){
    Object.assign(config, JSON.parse(readFileSync(configFile, { encoding: 'utf-8' })))
    console.debug(`从${configFile}中读取配置文件`, config)
}

const app = require('fastify')({ logger: true })

const ok = (data, message)=> ({data, message, success: true})
const error = (message, data)=> ({data, message, success:false})

/*
 * ==================== 添加统一异常处理 ====================
 */
app.setNotFoundHandler((req, res)=> res.status(404).send(error(`${req.url} NOT FOUND`)))
app.setErrorHandler((e, req, res)=>{
    app.log.error(e)
    res.status(500).send(error(e.message))
})

app.addHook('preHandler', (req, res, done)=>{
    const route = req.routeOptions.url
    if(!!route){
        /**@type {String} */
        let ua = req.headers['ua']
        if(!!ua){
            let tmp = ua.split("-", 6)
            if(tmp.length >= 3){
                const user = { id:tmp[0], name: decodeURIComponent(tmp[1]), ip:tmp[2], roles: (tmp[3]||"").split(",")}
                req.user = user
                app.log.debug(`[${route}] 解析用户信息 ${ua}`)
            }
            else
                app.log.error(`[${route}] 无效的用户信息 ${ua}`)
        }
    }
    // 开启 CORS
    res.header("Access-Control-Allow-Origin", req.headers.origin)
    res.header("Access-Control-Allow-Credentials", 'true')
    res.header("Access-Control-Allow-Headers", "*")
    res.header("Access-Control-Allow-Methods", "*")
    done()
})

/*
 * ==================== 添加路由处理 ====================
 */
// 允许所有 OPTIONS 类型的请求（通常是浏览器的预检策略）
app.options("/*", (req, res)=> res.send())

// application/json 格式参数
app.post("/add", (req, res)=>{
    let { body } = req
    console.debug(typeof(body),body)
    if(Array.isArray(body)){
        let sum = 0
        body.forEach(v=> sum += isNaN(v)? 0 : Number(v))
        res.send(ok(sum))
    }
    else
        res.send(error(`参数必须是数组格式`))
})
app.post("/time", (req, res)=> {
    console.debug(req.headers)
    res.send(ok(Date().toString()))
})


app.listen({ port: config.port }, (err) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }

    app.log.info(`APP STARTED (PORT=${config.port})...`)
})
