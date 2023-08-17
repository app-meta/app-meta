import { existsSync, statSync, readFileSync, createWriteStream, createReadStream } from 'fs'

import got from 'got'
import chalk from 'chalk'
import AdmZip from 'adm-zip'
import Table from 'cli-table3'

import { getItem, setItem } from './stroe.js'
import { checkConfigValue, config } from './config.js'
import { appName } from './base.js'
import { aes } from '@app-meta/basic'
import { pipeline } from 'stream/promises'
import ora from 'ora'

// export const UID = "uid"
// export const HOST = "host"
// export const SECRET = "secret"
// export const CONFIGS = [ HOST, UID , SECRET ]
// export const REQUIRE_CONFIGS = [ HOST ]

let configs = undefined
let token = undefined

const TOKEN = "_TOKEN_"
const TOKEN_EXPIRE = "_TOKEN_EXPIRE_"

export const clearToken = ()=>{
    setItem(TOKEN, "")
    setItem(TOKEN_EXPIRE, 0)
}

export const loadLocalToken = ()=>{
    let old = getItem(TOKEN)
    let expire = getItem(TOKEN_EXPIRE)
    if(Date.now() < expire) return old

    clearToken()
    return undefined
}

/**
 * 加载配置信息到新对象
 * @param {*} required 是否对必填进行检测，碰到必填未填则直接报错
 * @returns
 */
export const loadConfig = (required=true)=>{
    if(configs) return configs

    configs = {}
    for (const key in config) {
        let c = config[key]
        configs[key] = getItem(key) ?? c.value

        if(required){
            if(c.required === true && configs[key] == undefined)
                throw Error(`配置项缺失：${key}/${c.summary} （请通过 \`${appName} config ${key} {值}\` 设置）`)

            c.check && checkConfigValue(key, configs[key])
        }
    }

    return configs
}

export const printObj = (title, obj={}, nameLen=15)=>{
    console.group(title)
    if(typeof(obj) === 'string')
        console.log(obj)
    else {
        for(let key in obj)
            console.log(`${key.padEnd(nameLen," ")}${obj[key]??"(未定义)"}`)
    }
    console.groupEnd()
}

export const printOK = (msg="")=> console.log(`${chalk.bgGreen("ok ^.^")} ${msg}`)

export const printDebug = (msg, ...ps)=> console.log(`[DEBUG] ${msg}`, ...ps)

const simpleChars = {
    'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '',
    'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': '',
    'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': '',
    'right': '' , 'right-mid': '' , 'middle': '|'
}
// {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''}

/**
 * 打印控制台表格，更多配置详见 https://github.com/cli-table/cli-table3
 *
 * @param {Array|Object} rows       数组或者对象
 * @param {String|Array} header     总标题（传递 String 时默认居中）
 * @param {Array} colWidths         列宽度，如[10,40]
 * @param {Boolean} simple          是否简化边框显示
 */
export const printTable = (rows=[], header, colWidths=[], simple=true)=>{
    let isArr = Array.isArray(rows)
    if(!(isArr || typeof(rows)=='object'))    throw `参数 rows 必须为数组或者对象`

    let colSpan = isArr? (Array.isArray(rows[0])?rows[0].length:rows.length): 2

    let t = new Table({
        head: header?(typeof(header)=='string'?[{colSpan, content: header, hAlign:'center'}]:header):[],
        style: { 'padding-left': 1, 'padding-right': 1 },
        colWidths,
        chars:  simple? simpleChars:undefined
    })

    if(isArr)
        t.push(...rows)
    else
        t.push(...Object.keys(rows).map(k=>([k, rows[k]])))

    console.log(t.toString())
}

/**
 *
 * @param {*} rows      数据对象数组
 * @param {*} ignores   忽略的字段
 * @param {*} transform 转换器（对应每个字段，必须是 function）
 * @returns
 */
export const printObjects= (rows=[], ignores=[], transform={})=>{
    stopLoading()

    let isRes = typeof(rows) === 'object' && rows.data
    let items = isRes ? rows.data : rows
    if(!Array.isArray(items) || items.length==0)  return console.debug(`待显示内容非数组或为空`)

    let size = items.length
    if(Array.isArray(items[0])){
        printTable(items.slice(1), items[0])
        size = items.length - 1
    }
    else if(typeof(items[0])==='string'){
        items.forEach(i=> console.log(i))
    }
    else{
        let fields = Object.keys(items[0])
        if(ignores.length)  fields = fields.filter(f=> !ignores.includes(f))
        printTable(items.map(r=> fields.map(f=> transform[f]?transform[f](f, r):r[f])), fields)
    }

    isRes && console.log(`\n查询到 ${size} 条记录，耗时 ${rows.used} ms`)
}

/**
 * 从对象列表中构建二维数组
 * @param {*} list
 * @param {*} fields
 * @param {*} header
 * @returns
 */
export const buildTableRows = (list, fields=[], header=false)=> {
    let rows = []
    header && rows.push(fields)
    list.forEach(d=> rows.push(fields.map(f=>d[f])))
    return rows
}

/**
 * @type {import('ora').Ora}
 */
let spinner
export const stopLoading = (text, isOk=true)=> {
    if(!spinner)    return text && console.log(text)

    isOk ? spinner.succeed(text) : spinner.fail(text)
}
/**
 * 开始一个加载动画
 * @param {String|Object} textOrOptions
 * @returns
 */
export const startLoading = (textOrOptions)=> {
    stopLoading()
    spinner = ora(textOrOptions).start()
    return spinner
}

/**
 * 由于使用的是 app.parseAsync 进行统一异常捕获，调用此方法时，请使用 await callServer 的方法
 * 否则无法正常捕获到异常
 *
 * @param {String}  action
 * @param {Object}  data
 * @param {boolean} bodyType    0=JSON 格式，1=Form，2=BODY（发送文件），3=GET 方式提交
 * @param {boolean} withToken
 * @param {Object}  options
 * @returns
 */
export const callServer = async (action, data={}, bodyType=0, withToken=true, options={}, saveToFile)=> {
    let started = Date.now()

    let body = Object.assign({}, options)
    if(bodyType != 3)
        body[bodyType==0?'json': (bodyType==1?'form':'body')] = data

    if(!configs)    loadConfig()
    let method = bodyType == 3 ? "get":"post"

    // 构建 header
    let headers = { CHANNEL: "cli" }
    if(withToken){
        if(!token){
            token = loadLocalToken()

            if(!token){
                if(!configs.secret) throw Error(`请先通过 ${appName} config secret {你的密钥} 设置密钥`)

                let text = Buffer.from(aes.encrypt(`${configs.uid}-${Date.now()}`, configs.secret)).toString('base64')
                token = await got.post(`${configs.host}/outreach/create-token`, { form: { text }}).text()
                if(token.startsWith("{")){
                    let json = JSON.parse(token)
                    throw Error(`无法获取 TOKEN：${json.message}`)
                }

                setItem(TOKEN, token)
                setItem(TOKEN_EXPIRE, Date.now() + 15*60*1000)
            }
        }

        headers[configs.header] = token
    }

    body.headers = headers

    let url = `${configs.host}${action}`
    if(!!saveToFile && typeof(saveToFile) == 'string'){
        await pipeline(
            got.stream[method](url, body),
            createWriteStream(saveToFile)
        )
        console.log(`服务器响应写入到 ${saveToFile}（SIZE=${statSync(saveToFile).size})\n`)
        /*
        打印首行内容，方便判断是否下载成功 =.=
        如果服务器报错，则会显示响应的错误
        */
        console.log(chalk.magenta(`--------------------------------- 首行内容 ---------------------------------`))
        console.log(await readFirstLine(saveToFile))
        console.log(chalk.magenta(`--------------------------------- 首行内容 ---------------------------------`))
    }
    else{
        let res = await got[method](url, body).json()
        if(res.success===true){
            res.used = ((Date.now() - started)/1000).toFixed(3)
            return res
        }
        else{
            throw Error(`操作失败，服务器返回信息：`+res.message)
        }
    }
    // return new Promise(async (ok, fail)=> {
    //     if(!configs){
    //         try{
    //             loadConfig()
    //         }catch(e){
    //             return fail(e.message)
    //         }
    //     }

    //     let headers = {}
    //     if(withToken){
    //         if(!token){
    //             if(!configs.secret) throw Error(`请先通过 ${appName} config secret {你的密钥} 设置密钥`)

    //             let text = Buffer.from(aes.encrypt(`${configs.uid}-${Date.now()}`, configs.secret)).toString('base64')
    //             let token = await post(`${configs.host}/outreach/create-token`, { form: { text }}).text()
    //             if(token.startsWith("{")){
    //                 let json = JSON.parse(token)
    //                 throw Error(`无法获取 TOKEN：${json.message}`)
    //             }
    //         }

    //         headers[configs.header] = token
    //     }

    //     got
    //         .post(`${configs.host}${action}`, {})
    //         .json()
    //         .then(res=>{
    //             if(res.success===true)
    //                 ok(res.data)
    //             else{
    //                 console.error(`操作失败，服务器返回信息：`, res.message)
    //             }
    //         })
    //         .catch(e=>{
    //             // throw Error(e.message)
    //             fail(e.message)
    //         })
    // })
}

/**
 * 压缩本地文件夹
 * @param {*} originDir
 * @param {*} targetZip
 * @param {*} filenameFilter    文件名过滤器，示例： name=> name!="package.json" && !name.endsWith("LICENSE.txt") && !name.endsWith(".pack.zip")
 * @returns
 */
export const zipDir = (originDir, targetZip, filenameFilter) => new Promise((ok)=>{
    var zip = new AdmZip()
    // add local file
    zip.addLocalFolder(originDir, undefined, filenameFilter)
    // get everything as a buffer(zip.toBuffer()) or write everything to disk
    zip.writeZip(targetZip, e=> !e && ok(targetZip))
})

// 同步判断给定路径是否为文件夹
export const isDir = d=> existsSync(d) && statSync(d).isDirectory()

export const isFile = f=> existsSync(f) && statSync(f).isFile()

export const sleep = times=> new Promise(ok=> setTimeout(ok, times))

export const tryLoadFile = file=>{
    if(file){
        if(!isFile(file))    throw `${file} 不是一个有效的文件`
        return readFileSync(file, {encoding})
    }
    else
        throw `请指定文件（-f, --file）`
}

/**
 * 读取指定文件的第一行内容
 * 代码来自： https://github.com/pensierinmusica/firstline/blob/master/index.js
 *
 * @param {*} path
 * @param {*} options
 * @returns
 */
export const readFirstLine = (path, options={})=>{
    const opts = { encoding: 'utf8', lineEnding: '\n' }
    Object.assign(opts, options)
    return new Promise((resolve, reject) => {
        const rs = createReadStream(path, { encoding: opts.encoding })
        let acc = ''
        let pos = 0
        let index
        rs
            .on('data', chunk => {
                index = chunk.indexOf(opts.lineEnding);
                acc += chunk;
                if (index === -1) {
                    pos += chunk.length;
                } else {
                    pos += index;
                    rs.close();
                }
            })
            .on('close', () => resolve(acc.slice(acc.charCodeAt(0) === 0xFEFF ? 1 : 0, pos)))
            .on('error', err => reject(err))
    })
}
