/*
 * @Author: 集成显卡
 * @Date: 2023-05-04 13:57:50
 * @Last Modified by:   集成显卡
 *
 * 网页机器人执行工具
 */
const { join } = require("path")
const { BrowserWindow } = require("electron")
const Mustache = require('mustache')

const { compact, datetime } = require("../common/date")
const logger = require("../common/logger")
const C = require("../Config")
const R = require("../Runtime")
const U = require("../common/util")
const { writeFileSync } = require("fs")

const preload   = join(__dirname, '../preload/api-robot.js')

const CODES = {
    '-1': "失败",
    '-2': "超时",
    '100': "完成",
    '0': "就绪"
}

/**
 * 任务对象属性如下
 *
 * windowWidth      窗口高度，单位 px
 * windowsHeight    窗口宽度，单位 px
 * snapshot         是否在任务结束时截图，默认 true
 * merge            是否将数据保存到同一目录下，默认 true
 * timeout          执行超时，单位 秒，默认 180
 * headers          额外的 header，用换行符 \n 进行分割
 * delay            延时执行脚本，单位 秒，默认 2
 * url              网站首页
 * code             机器人脚本代码
 */
module.exports = class {
    startOn     = 0                         //开始时间点
    endOn       = 0                         //结束时间点，不管成功与否
    counter     = 0                         //执行次数
    uuid        = ""
    snapshot    = ""                        //任务截图

    caches      = {}

    #downloadNames = {}                     //下载文件名称映射

    /**
     * @param {*} page      页面对象
     * @param {*} bean      机器人对象
     * @param {*} params    运行时参数
     */
    constructor({ page, bean, params={} }){
        this.bean       = bean
        this.params     = params

        this.timestamp  = compact()
        this.id         = `${page.aid}-${page.id}`
        this.aid        = page.aid
        this.pid        = page.id
        this.name       = page.name || bean.name || this.id
        this.uuid       = `${this.id}-${this.timestamp}`
        logger.info(`初始化网页脚本机器人 ${this.name}, 参数：${U.toJSON(params)}`)

        this.window     = null
        this.complete   = false
        this.status     = 0
        this.logs       = []
    }

    log (msg){
        let line = this.#buildMsg(msg)
        logger.info(line)
        this.logs.push(`${datetime()} ${msg}`)
        // this.onLog(line, LOG_SYS)
    }

    #buildMsg = msg=> `[${this.uuid}] ${msg}`

    /**
     * 根据任务的合并配置（merge）返回对应的数据文件
     *
     * @param {*} filename
     * @returns
     */
    #dataFile = (filename) => U.getWorkerPath(this.bean.merge===true?this.getId():this.getUUID(), filename)

    /**
     * 开始执行机器人（创建新窗口）
     */
    start (){
        this.counter = 0
        this.startOn = Date.now()

        if(!this.window){
            //第一次运行时，需要创建浏览器窗口
            this.window = new BrowserWindow({
                show            : false,
                frame           : true,
                width           : this.bean.windowWidth?? C.windowWidth,
                height          : (this.bean.windowHeight?? C.windowHeight) + (R.isDev?180:0),
                title           : this.name,
                webPreferences  : {
                    contextIsolation: true,
                    nodeIntegration: false,
                    preload
                }
            })

            this.window.on('ready-to-show', ()=>{
                this.window.show()
                if(R.isDev) this.window.webContents.openDevTools()
            })

            this.window.on('close', ()=> this.onComplete())
            this.window.on('closed', ()=> this.log("任务窗口已关闭..."))
            this.window.onE
        }

        let web = this.window.webContents

        //打开任务主页面
        logger.info(`开启机器人${this.id}，首页为 ${this.bean.url}`)
        this.window.loadURL(this.bean.url, { extraHeaders: this.bean.headers })

        // 添加事件监听
        if(web){
            //dom-ready,did-finish-load
            /**
             *  2019年08月28日
             *      did-finish-load 事件触发事件较晚，现改成 dom-ready 事件
             */
            web.on('dom-ready', e=>this.#execJavaScriptForLoaded(e))
            // web.on("did-finish-load", e=>this._execJavaScriptForLoaded(e))
            web.on("did-navigate-in-page", e=>this.#execJavaScriptForLoaded(e))
            web.on("did-fail-load", this.#onPageLoadFail)
            /**
             * 监听文件下载
             */
            web.session.on('will-download', (event, item, contents)=>{
                let specialName = this.#downloadNames[U.md5(item.getURLChain()[0])]
                /*
                如果给定的路径文件绝对路径则直接使用
                否则使用“任务目录”为根目录
                */
                let targetFile = specialName ? (/^[a-zA-Z]:/.test(specialName)? specialName:U.getWorkerPath(this.getId(), specialName)) : U.getWorkerPath(this.getUUID(), item.getFilename())
                this.log(`开始下载文件 ${item.getFilename()} 到 ${targetFile}`)

                item.setSavePath(targetFile)
                item.once('done', (doneE, state)=>{
                    let isComplete = state==="completed"
                    this.log(`文件下载${isComplete?"成功":"失败"}...`)

                    //调用方法，告之文件下载完成，传递两个参数： state，文件名（如下载失败，此值为 nlll)
                    let doneFunc = this.bean.downloadFunc||"_onDownloadDone"
                    this.#execJavaScript(`${doneFunc} && ${doneFunc}("${state}", "${isComplete?targetFile.replace(/\\/g,'/'):null}")`)
                })
            })
            /**
             * 2022年7月15日
             *      处理新窗口打开
             *      目前的策略是点击跳转的新窗口均在任务窗口中打开
             */
            web.setWindowOpenHandler( detail => {
                let { url, referrer } = detail

                this.log(`打开新页面：${url} (源URL=${referrer.url})`)
                this.window.loadURL(url, { extraHeaders: this.bean.headers })

                return {action: 'deny'}
            })
        }
    }

    /**
    * 任务结束时的后续操作
    */
    onComplete() {
        this.window = null
        this.complete = true
        this.endOn = Date.now()

        //关闭文件流
        // Object.values(this.#fileStreams).forEach(s => s.close && s.close())

        this.log(`已结束（STATE=${this.status}）， 耗时：${(this.endOn - this.startOn) / 1000} 秒...`)

        if(typeof(this.onClosed)==='function') this.onClosed(this)
    }

    /**
     * 进度处理
     * @param {*} p
     * @param {*} msg
     */
    updateProgress (p, msg) {
        p = parseInt(p)
        if(isNaN(p))    return
        p = p>100?100: (p<-2? -1: p)
        this.log(`<进度 ${p < 0 ? p : (p + "%")}> ${msg}`)

        this.status = p

        if (p < 0 || p >= 100) {
            this.log(`任务${CODES[p]}, ${C.rpa.closeDelay} 秒后关闭窗口...`)

            let snapshot = this.bean.snapshot ?? false
            logger.debug(`${this.uuid} 任务窗口即将关闭(snapshot=${snapshot})...`)
            if(snapshot){
                //截图到附件目录
                this.window.capturePage().then(image=>{
                    let targetFile = this.#dataFile(`SNAPSHOT-${this.timestamp}.png`)
                    U.saveFile(targetFile, image.toPNG())
                    this.log(`保存任务截图到 ${targetFile}`)
                })
            }

            setTimeout(async () => {
                if (this.window){
                    this.window.close()
                }
                else
                    this.onComplete()
            }, C.rpa.closeDelay * 1000)
        }
    }

    onCache (key, data){
        if(R.verbose) this.log(`缓存数据 ${key}=${JSON.stringify(data)}`)

        this.caches[key] = data
    }

    getId       = ()=> this.id
    getName     = ()=> this.name
    getUUID     = ()=> this.uuid
    getWindowId = ()=> this.window.id
    isComplete  = ()=> this.complete
    summary     = ()=>({
        aid     : this.aid,
        pid     : this.pid,
        status  : this.status,
        counter : this.counter
    })

    /**
     * 判断机器人是否已经超时
     * @returns
     */
    isTimeout   = ()=> ((Date.now() - this.startOn)/1000000) - (this.bean.timeout??C.rpa.timeout) >= .0

    onDownload (url, filename){
        this.#downloadNames[U.md5(url)] = filename
        this.window.webContents.downloadURL(url)
    }

    /**
     * 写入到文件
     * @param {String} content
     * @param {String} filename
     * @param {Boolean} binary
     */
    saveToFile (content, filename, binary=false){
        R.verbose && logger.info(`写入内容到文件 ${filename}（binary=${binary}）`)
        //写入二进制，.toString('binary')
        writeFileSync(
            this.#dataFile(filename),
            binary?
                Buffer.from(content, 'base64')
                :
                content
        )
    }

    // ===============================================================================================================
    // START 任务脚本注入相关
    // ===============================================================================================================

    #execJavaScript (script){
        if(!this.window || !this.window.webContents)
            return this.log(`window 对象为空或者无效窗口，无法执行脚本： ${script}`)

        this.window.webContents.executeJavaScript(script, true)
            // .then(result=>{
            //     this.log(`执行${category}脚本成功：${result}`)
            // })
            .catch(e=>{
                this.log(`执行脚本失败：${e.message}`)
                R.verbose && logger.error(`机器人 #${this.getUUID()} 执行脚本出错`, e)
            })
    }

    /**
     * 执行特定的脚本，当页面加载完成或者更新location时执行
     * @param {*} event
     */
    #execJavaScriptForLoaded (event){
        //获取脚本
        let script = this.#buildScript()

        if(script){
            logger.debug(`开始执行任务脚本（len=${script.length}）...`)
            // if(R.isDev) console.debug(script)
            this.window.webContents.executeJavaScript(script, true)
                .then(result =>{
                    // logger.info(this.#buildMsg("执行脚本结果："), result)
                })
                .catch(error => logger.error(this.#buildMsg("执行脚本出错："), error))
        }
    }

    /**
     * 加载任务脚本
     */
    #buildScript (){
        let scriptStack = []

        //尝试加载网站通用脚本
        // const commonScript = U.getScript(`${this.mission.site}`)
        // if (commonScript) {
        //     this._log(`加载 通用模块 ${this.mission.site}.js ...`)
        //     scriptStack.push(commonScript)
        // }

        //先判断是否任务中已经存在 script 属性
        if (this.bean.code) scriptStack.push(this.bean.code)

        return this.#handingScriptBeforeExec(scriptStack.join(';'))
    }

    /**
     * 对于某些网站，可能同时触发了 did-finish-load，did-navigate-in-page ，为防止脚本被执行两次，这里加入了重复机制
     *
     *  注入：Task 对象（当前的任务）
     *  默认 3000 后才执行任务脚本
     * @param {*} script
     */
    #handingScriptBeforeExec (script) {
        const code = `T${Buffer.from(this.id).toString("HEX")}`

        let taskClone = Object.assign({}, this.bean)
        delete taskClone['code']

        let model = {
            ticket  : code,                     //任务代码唯一标识
            id      : this.id,                  //任务ID
            robot   : U.toJSON(taskClone),      //机器人基本信息（JSON 格式串）
            params  : U.toJSON(this.params),    //提交的参数（JSON 格式串）
            counter : this.counter ++,          //计数器
            caches  : U.toJSON(this.caches),    //缓存数据（JSON 格式串）
            script,                             //实际要执行的代码
            delay   : this.bean.delay           //延迟（秒）
        }

        return Mustache.render(
            `if(window.{{ticket}} !== true){
                setTimeout(async function(){
                    const robot = {{{robot}}}
                    const params = {{{params}}}
                    const counter = {{{counter}}}
                    const caches = {{{caches}}}

                    console.log('Robot init ok, ID={{id}}, PARAMS=', params,'COUNTER=', counter)
                    try{
                        {{{script}}}
                    }catch(error){
                        console.error("error on run web script:", error)
                        META.log("脚本执行出错："+error.message, "error")
                        // META.failed("脚本执行出错： " + error.message, 3000)
                    }
                }, 1000*{{delay}})

                window.{{ticket}}=true
                if(!window.__UUID__) window.__UUID__ = "{{id}}"
                console.log("{{ticket}} set to true...", Date())
            }`,
            model
        )

        // return `
        //     if(window.${code} !== true){
        //         setTimeout(async function(){
        //             const robot = ${U.toJSON(taskClone)}
        //             const params = ${U.toJSON(this.params)}
        //             const counter = ${this.counter++}
        //             const caches = ${U.toJSON(this.caches)}

        //             console.log('Robot init ok, ID=${this.id}, PARAMS=', params,'COUNTER=', counter)
        //             try{
        //                 ${script}
        //             }catch(error){
        //                 console.error("error on run web script:", error)
        //                 META.log("脚本执行出错："+error.message, "error")
        //                 // META.failed("脚本执行出错： " + error.message, 3000)
        //             }
        //         }, 1000*${this.bean.delay})

        //         window.${code}=true
        //         if(!window.__UUID__) window.__UUID__ = "${this.id}"
        //         console.log("${code} set to true...", Date())
        //     }
        // `
    }

    /**
     * LOGS：
     * 2017年6月23日
        页面加载失败，经调研，一些子内容的加载失败也会触发此事件，故要做一些判断
        目前判断条件：
        isMainFrame == true 才认为是任务无法加载页面
    *
    *
    * @param {*} e
    * @param {*} errorCode
    * @param {*} errorDescription
    * @param {*} validatedURL
    * @param {*} isMainFrame
    */
    #onPageLoadFail (
        e,
        errorCode,
        errorDescription,
        validatedURL,
        isMainFrame
        ){
        if (!!isMainFrame) {
            if (this.bean && errorCode === -3)
                return

            const msg = '无法加载网页：' + (e.message ? e.message : this.task.url)
            logger.info(msg)
            this.log(msg)

            this.updateProgress(-1, msg)
        }
    }
    // ===============================================================================================================
    // END 任务脚本注入相关
    // ===============================================================================================================
}
