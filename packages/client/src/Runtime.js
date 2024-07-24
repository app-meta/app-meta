const { app } = require('electron')
const { dirname, resolve, basename } = require('path')

const { appName, appId } = require("../package.json")

let appPath = !!app ?
    (app.isPackaged ? dirname(app.getPath('exe')) : app.getAppPath())
    : __dirname

if(basename(appPath) === 'src')
    appPath = dirname(appPath)
const dataPath = resolve(appPath, "data")
// const secretKey = md5(getMAC())

const isDev = process.env.NODE_ENV !== undefined //process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',

module.exports ={
    appId,
    appName,
    appPath,
    dataPath,
    background  : "#f1f2f3",
    isWindow    : process.platform === 'win32',
    isMac       : process.platform === 'darwin',
    isLinux     : process.platform === 'linux',
    mode        : process.env.NODE_ENV,
    isDev,
    verbose     : isDev,                            //是否显示详细的日志
    mainWindowID: -1,
    dataDir     : sub =>{
        return resolve(dataPath, sub)
    },
    resDir      : sub => resolve(appPath, "resources", sub)
}
