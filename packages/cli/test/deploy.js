#!/usr/bin/env node

const { existsSync, statSync, readFileSync, createReadStream } = require('fs')
const path = require('path')

const { aes } = require('@app-meta/basic')
const AdmZip = require('adm-zip')
const { post } = require('got')
// 使用 axios 的话，打包后体积大了 110 KB .....
// const { post } = require('axios')

// 打包体积约为 160KB
const FormData = require("form-data")

const { argv, cwd } = require('process')

const isDir = d=>existsSync(d) && statSync(d).isDirectory()

const zip = (originDir, targetZip) => new Promise((ok)=>{
    var zip = new AdmZip()
    // add local file
    zip.addLocalFolder(originDir, undefined, name=> name!="package.json" && !name.endsWith("LICENSE.txt") && !name.endsWith(".pack.zip"))
    // get everything as a buffer(zip.toBuffer()) or write everything to disk
    zip.writeZip(targetZip, e=> !e && ok(targetZip))
})

const target = argv[2]
if(!target) throw Error(`请指定模块，如 cli.js {模块名}`)

const root = (()=>{
    for(let p of ['', 'packages/']){
        let d = `${p}${target}`
        if(isDir(d))
            return d
    }
    throw Error(`找不到模块 ${target}`)
})()

console.debug(`即将对模块 ${target}（根目录=${root}） 进行压缩、部署操作...\n`)

async function start(pack=true, deploy=true){
    let now = new Date
    let packFile = `${root}/${target}.pack.zip`

    if(pack){
        let originDir = isDir(`${root}/dist`)? `${root}/dist`: root
        console.debug(`[压缩] 开始压缩 ${originDir}`)
        zip(originDir, packFile)
        console.debug(`[压缩] 数据文件压缩到 ${packFile}`)
    }

    if(deploy) {
        if(!existsSync(packFile))   return console.error(`[部署] 找不到资源 ${packFile}，请检查...`)

        /**
         * 配置文件格式
        {
            "HOST": "http://localhost:10086/app-meta",
            "SECRET": "{后台终端的密钥}",
            "UID": "{登录的用户ID}"
        }
         */
        let metaJSON = `${cwd()}/meta-cli.json`
        if(!existsSync(metaJSON))   return console.error(`[部署] 找不到配置文件 ${metaJSON}，请创建并配置参数...`)
        const PS = require(metaJSON)

        const pkg = JSON.parse(readFileSync(`${root}/package.json`, {encoding:'utf-8'}))
        console.debug(`[部署] 获取到 ${PS.UID} 的token， 即将部署到（AID=${pkg.appId} / ${pkg.pageId}）...`)
        if(!pkg.appId){
            console.error(`[部署] package.json 文件中未定义 appId、pageId`)
            return
        }

        let text = btoa(aes.encrypt(`${PS.UID}-${Date.now()}`, PS.SECRET))
        let token = await post(`${PS.HOST}/outreach/create-token`, { form: { text }}).text()
        if(token.startsWith("{")){
            let json = JSON.parse(token)
            console.error("[部署] 无法获取 TOKEN：", json.message)
            return
        }

        let headers = {'MUA': token}

        let body = new FormData()
        body.append('file', createReadStream(packFile))
        body.append('version', `${now.getFullYear()-2000}.${now.getMonth()+1}.${now.getDate()}`)
        body.append('summary', argv[3]||'')
        body.append('aid', pkg.appId)
        body.append('pid', pkg.pageId)

        let res = await post(`${PS.HOST}/page/${pkg.template}/deploy`, { body, headers }).json()

        if(res.success===true){
            console.debug(`[部署] 完成^.^ ${res.message||""}`)
        }
        else{
            console.error(`[部署] 操作失败，服务器返回信息：`, res.message)
        }
    }
}

start(true, true)
