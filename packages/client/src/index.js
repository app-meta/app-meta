const { join } = require('path')
const { app, protocol, BrowserWindow, Menu, shell, dialog }= require('electron')

const R = require('./Runtime')
const C = require('./Config')
const logger = require('./common/logger')
const { onBootstrap } = require('./core/Init')
const { repairAndCheck, runRobot } = require('./core/RobotManage')
const { setToken } = require('./service/Http')
const { mainPreload, createMainWindow } = require('./service/Helper')
const { launchWorker } = require('./worker')
// const { broadcastAll } = require('./service/Global')

const API = require('./sdk')


const htmlFile = (name='index') => join(__dirname, `../www/${name}.html`)

//不提示安全信息
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
//为防止程序异常退出，可添加如下全局异常处理程序
process.on('uncaughtException', e => {
    console.error("未捕获的异常", e)
    logger.error(e)
})
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

let mainWindow  = null

/**
 * Restore existing BrowserWindow or Create new BrowserWindow
 */
async function restoreOrCreateWindow() {
    if (!mainWindow || !mainWindow.id)
        await createWindow()

    if (mainWindow.isMinimized())
        window.restore()

    mainWindow.focus()
}

async function createWindow() {
    mainWindow = createMainWindow()

    // mainWindow.setMenu(null)
    // 设置全局菜单不显示，如果某个窗口需要菜单，则通过 window.setMenu 方法
    Menu.setApplicationMenu(null)

    mainWindow.isMain = true

    if (R.isWindow)  app.setAppUserModelId(C.displayName)

    // process.env.WEBPACK_DEV_SERVER_URL = http://localhost:3000/
    let target = `${C.serverHost}${C.serverContext}${C.serverContext.endsWith(".html")?"":"/"}`
    if (process.env.HOME_PAGE) {
        logger.debug(`开发模式=${R.isDev}，地址为 ${process.env.HOME_PAGE}...`)
        target = process.env.HOME_PAGE
    }

    if(!target){    // || target.indexOf("http://localhost") === 0
        let indexHtml = htmlFile()
        logger.info(`检测到远程地址 ${target} 不规范，即将打开本地 ${indexHtml}`)
        mainWindow.loadFile(indexHtml)
    }
    else{
        //判断是否启用工作者模式
        if(C.worker.enable === true){
            mainWindow.loadFile(htmlFile('worker'))

            if(!(C.worker.tokenKey && C.worker.dataKey)){
                dialog.showErrorBox(`参数缺失`, `TOKEN或数据交互的密钥缺失，无法启动[工作者模式]，请添加参数后重试！`)
                app.exit(-1)
            }
            launchWorker().catch(e=>{
                R.verbose && logger.info(`工作者启动失败`, e)
                dialog.showErrorBox(`工作者启动失败`, typeof(e)==='string'? e:e.message)
                app.exit(-1)
            })
        }
        else{
            mainWindow.loadURL(target)
        }
    }

    mainWindow.once('ready-to-show', ()=>{
        if(R.isDev) logger.debug("主窗口触发 ready-to-show 事件...")

        R.mainWindowID = mainWindow.id
    })

    /**
     * External hyperlinks open in the default browser.
     *
     * @see https://stackoverflow.com/a/67409223
     */
    let { webContents } = mainWindow

    webContents.setWindowOpenHandler( detail => {
        let { url, referrer } = detail
        let isInner = url.indexOf(referrer.url)==0
        logger.debug(`打开页面：${url}`, `（内部页面=${isInner}, referrer=${referrer.url}）`)
        // logger.debug(JSON.stringify(detail, null, 4))

        //打开内部网页 或者 本地调试的前端项目
        if(isInner || url.startsWith("http://localhost:")){
            return {
                action: 'allow',
                overrideBrowserWindowOptions:{
                    //隐藏菜单栏
                    autoHideMenuBar: true,
                    webPreferences:{ nativeWindowOpen: true, preload: mainPreload }
                }
            }
        }
        else {
            shell.openExternal(url)
            return { action: 'deny' }
        }
    })
    webContents.on('did-fail-load',  (e, errorCode, errorMsg, url)=> {
        logger.error(`加载页面 ${url} 失败: ${errorCode} ${errorMsg }`)
        mainWindow.loadFile(join(__dirname, `../index.html`), {query:{code:errorCode, msg:`${url} 加载失败`}})

        // setTimeout(()=> broadcastAll("robot.done", '1', {status:100, message:"已完成"}), 10000)
    })

    onBootstrap(mainWindow)
}

/**
 * Disable Hardware Acceleration for more power-save
 */
app.disableHardwareAcceleration()

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        logger.debug(`所有窗口均关闭，3 秒后关闭程序...`)
        setTimeout(app.quit, 3000)
    }
})
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) restoreOrCreateWindow()})
/**
 * 系统开启第二个实例时触发，通常用于伪协议响应
 */
app.on('second-instance', restoreOrCreateWindow)

app.whenReady()
    .then(async ()=>{
        API()

        logger.debug(`环境 process.env.NODE_ENV=${process.env.NODE_ENV}`)
        let ps = require("minimist")(process.argv.slice(app.isPackaged ? 1: 2))
        //指定执行默认脚本
        if (!!ps.script) {
            logger.info(`命令行执行脚本 ${ps.script}(DIR=${__dirname}) ...`)
            console.group("配置参数")
            Object.keys(C).forEach(k => console.log(`${k} = ${typeof(C[k])==='object'? JSON.stringify(C[k]):C[k]}`))
            console.log()
            console.groupEnd()

            try{
                if(!!ps.token){
                    //优先使用命令行传递的 token
                    setToken(ps.token)
                }
                else if(R.isDev && !!C.token){
                    logger.info(`开发模式下自动设置用户 token （请配置 config.json）...`)
                    setToken(C.token)
                }
                const item = require(`${ps.script}`)
                runRobot(repairAndCheck(item))
            }
            catch(e){
                logger.error(`读取脚本 ${ps.script} 失败`, e)
                process.exit(-1)
            }
        }
        else{
            restoreOrCreateWindow()
            if (R.isDev) logger.debug(`程序启动完成，enjoy ^.^ (dataPath=${R.dataPath})`)
        }
    })

// Auto-updates
if (process.env.NODE_ENV === 'production') {
    app.whenReady()
        .then(() => import('electron-updater'))
        .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
        .catch((e) => console.error('Failed check updates:', e))
}
