const { BrowserWindow, globalShortcut, Tray, Menu, app } = require('electron')

const R = require("../Runtime")
const logger = require("../common/logger")
const { icons } = require('./App')

let mainWindow

function initKeyboard() {
    /**
     * 快速打开开发者面板
     */
    globalShortcut.register('CommandOrControl+F12', () => {
        let curWin = BrowserWindow.getFocusedWindow()
        if(curWin != null){
            curWin.webContents.isDevToolsOpened() ? curWin.webContents.closeDevTools() : curWin.webContents.openDevTools()
            if(R.isDev) logger.debug(`CTRL+F12 快捷键...`)
        }
    })

    globalShortcut.register('CommandOrControl+R', ()=> {
        let curWin = BrowserWindow.getFocusedWindow()
        curWin && curWin.reload()
    })
}

function initTray(){
    const tray = new Tray(icons.logo)
    const menus = Menu.buildFromTemplate([
        // { type: 'separator'},
        { label:"重新加载", icon: icons.refresh, click:()=> mainWindow && mainWindow.reload() },
        { label:"关于", icon: icons.about, click: ()=>{} },
        { type: 'separator'},
        { label: "退出平台", icon: icons.quit, click: () => app.exit() }
    ])
    tray.setToolTip(`点击打开主页面`)
    tray.on('click', e=> mainWindow && mainWindow.show())

    tray.setContextMenu(menus)
}

exports.onBootstrap = (_mainWin)=>{
    mainWindow = _mainWin
    initKeyboard()

    initTray()
}
