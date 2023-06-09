/*
 * @Author: 集成显卡
 * @Date: 2022-02-04 22:58:23
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-05-04 14:52:19
 */
const { existsSync, readFileSync } = require('fs')

const R = require("./Runtime")

let C = {
    displayName: R.appName,

    /**
     * 服务端设置
     */
    serverHost: "http://168.55.6.15:6060",
    serverContext: "/app-meta",

    windowMax: false,                       //是否启用全屏
    windowWidth: 1680,                      //应用执行窗口默认宽度
    windowHeight: 900,                      //应用执行窗口默认高度

    /**
     * 自定义函数相关配置
     */
    // func: {
    //     isolated: true,                     //是否以隔离环境运行函数
    //     hotload: true,                      //是否每次调用自定义函数前都清除缓存
    //     timeout: 120,                       //函数执行超时，默认 120 秒
    // },

    // 数据导出时默认的编码
    encoding: "UTF-8",
    /**
     * 附件（pdf、截图，下载文件等）保存的路径
     * uuid     任务ID
     * date     日期，格式：yyyyMMdd
     *
     * 注意，重名文件采取覆盖模式
     */
    attachPath: "attach/{uuid}/{date}",
    /**
     * 任务数据目录
     */
    workerPath: "robot/{uuid}",
    //通用分隔符
    split: "-",

    rpa : {
        windowWidth: 1280,                  //任务执行窗口默认宽度
        windowHeight: 640,                  //任务执行窗口默认高度
        timeout: 3 * 60,                    //默认超时，单位秒
        delay: 2,                           //脚本延迟执行，默认2（单位 秒）
        closeDelay: 3,                      //任务完成后，等待多少秒自动关闭窗口，默认 3
    }
}

/**
 * 判断是否存在 config.json
 * 一旦存在，则读取并覆盖到 C 中
 */
let file = R.dataDir("config.json")
let jsonStr = existsSync(file) ? readFileSync(file, "UTF-8").trim() : ""

if (!!jsonStr && jsonStr.startsWith("{") && jsonStr.endsWith("}")) {
    console.debug(`读取 config.json 并覆盖默认的配置项....`)
    Object.assign(C, JSON.parse(jsonStr))
}

module.exports = C
