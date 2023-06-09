const { existsSync, statSync, readFileSync } = require('fs')
const configFile = "config.json"

const config = { port: 8080 }
if(existsSync(configFile) && statSync(configFile).isFile()){
    Object.assign(config, JSON.parse(readFileSync(configFile, { encoding: 'utf-8' })))
    console.debug(`从${configFile}中读取配置文件`, config)
}

const app = require('fastify')({ logger: true })

const ok = (data, message)=> ({data, message, success: true})
const error = (message, data)=> ({data, message, success:false})

// app.addContentTypeParser('application/x-www-form-urlencoded', function (request, payload, done) {
//     let body = ''
//     payload.on('data', d=>body += d)
//     payload.on('end', ()=>{
//         try {
//             const parsed = require("querystring").parse(body)
//             done(null, parsed)
//         } catch (e) {
//             done(e)
//         }
//     })
//     payload.on('error', done)
// })
app.setNotFoundHandler((req, res)=> res.status(404).send(error(`${req.url} NOT FOUND`)))
app.setErrorHandler((e, req, res)=>{
    app.log.error(e)
    res.status(500).send(error(e.message))
})
app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
    try {
        done(null, JSON.parse(body))
    } catch (err) {
        err.statusCode = 400
        done(err, undefined)
    }
})

// app.route({
//     url:"/add",
//     method:['GET','POST'],
//     handler: (req, res)=>{
//         let { body } = req
//         console.group("求和")
//         console.debug("参数=", body)
//         console.debug("用户=", req.headers.uid, decodeURI(req.headers.uname))
//         console.groupEnd()
//         if(body && "x" in body && "y" in body)  return res.send(ok(body.x + body.y))

//         res.send(error("参数 x，y 必须填写"))
//     }
// })
app.post("/add", (req, res)=>{
    let { body } = req
    app.log.info(`[ADD] ${body}`)
    if(Array.isArray(body)){
        let sum = 0
        body.forEach(v=> sum += isNaN(v)? 0 : Number(v))
        res.send(ok(sum))
    }
    else
        res.send(error(`参数必须是数组格式`))
})

app.listen({ port: config.port }, (err) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }

    app.log.info(`APP STARTED (PORT=${config.port})...`)
})
