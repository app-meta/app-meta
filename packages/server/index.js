const { readFile } = require('fs')
const { createServer } = require('http')
const { resolve, extname } = require('path')
const { parse } = require('url')

const { aes } = require("@app-meta/basic")

// const querystring = require('querystring')

const PORT = process.argv[2] || 8000

const RN        = "\r\n"
const ADMIN     = "admin"

/**
 * 获取客户端 IP 地址
 * @param {*} req
 * @returns
 */
let _getIp = req => {
    let ip = req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
    return ip.replace("::ffff:", "")
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} params
 */
let onAction = (pathname, params, res) => {
    let keys = Object.keys(params)
    if(keys.length>0) {
        console.group("Request 参数")
        Object.keys(params).forEach(k => console.debug(`${k} = ${params[k]}`))
        console.groupEnd()
    }

    return new Promise((ok, fail)=>{
        ok("南宁、广州、上海".split("、").map(v=>({value:v, label:v})))
    })
}

let _sendToResponse = (res, data)=>{
    res.writeHead(200, { 'content-type': 'text/json;charset=utf8' })
    res.end(JSON.stringify({data, success:true, message:""}))
}

const server = createServer((req, res) => {
    let { url, method } = req
    // 统一做静态资源处理
    let { pathname, query } = parse(url, true)
    console.debug(method, url)

    let isGet = method === "GET"
    if(pathname == "/cas"){
        let { token, uid } = query
        if(!uid)    uid = ADMIN
        console.debug(`[CAS] 登录 token=${token} uid=${uid}（密文：${aes.encrypt(uid, "34dhPTk21b64Jsza")}）`)
        // res.redirect(`http://localhost:3000/app-meta/login_with_cas_bck?ticket=${aes.encrypt(uid, "34dhPTk21b64Jsza")}&token=${token}`)
        res.writeHead(301, {'Location': `http://localhost:3000/app-meta/login_with_cas_bck?ticket=${aes.encrypt(uid, "34dhPTk21b64Jsza")}&token=${token}`})
        res.end()
    }
    else if(pathname.startsWith("/service/")){
        res.setHeader('Access-Control-Allow-Origin', '*')
        let keys = Object.keys(query)
        if(keys.length>0) {
            console.group("Request 参数")
            Object.keys(query).forEach(k => console.debug(`${k} = ${query[k]}`))
            console.groupEnd()
        }

        console.debug("Request Headers:", req.rawHeaders)
        return _sendToResponse(res, `path=${pathname}`)
    }

    if (!isGet) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        onAction(pathname, query, res).then(staff=> _sendToResponse(res, staff))
    }
    //静态资源处理
    else {
        if (pathname == "/") pathname = "/index.html"
        let realPath = resolve(__dirname,"www", pathname.substring(1))

        readFile(realPath, (err, doc) => {
            if (err != null) {
                console.error(`error on read ${realPath}`, err.message)
                res.writeHead(404, { 'content-type': 'text/html;charset=utf8' })

                return res.end()
            }
            //设置缓存失效时间180秒
            res.setHeader('Expires', new Date(Date.now() + 180 * 1000).toUTCString());
            //设置缓存失效时间180秒
            res.setHeader('Cache-Control', 'max-age=180');

            res.writeHead(200, { 'content-type': extname(realPath) })
            res.end(doc)
        })
    }
})

server.on('clientError', (e, socket) => {
    console.error(`Client Error:`, e.message)
    socket.end(`HTTP/1.1 400 Bad Request`)
})

server.listen(PORT)
console.info(`Server startup ok, listen on ${PORT}...`)
