const { BrowserWindow, screen, app } = require("electron");

app.whenReady().then(()=>{
    let { width, height } =  screen.getPrimaryDisplay().workAreaSize
    console.debug("workspace area size: width=", width, "height=", height)

    const winWidth  = 420
    const winHeight = 160

    const win = new BrowserWindow({
        title:"无边窗口",
        frame: false,
        width: winWidth,
        height: winHeight,
        closable: true,
        x: width-winWidth-10,
        y: height-winHeight-10,
        skipTaskbar: true
    })

    win.loadURL('https://baidu.com')
})
