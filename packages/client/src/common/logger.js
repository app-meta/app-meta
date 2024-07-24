/*
 * @Author: 集成显卡
 * @Date: 2022-12-02 10:05:37
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-03-08 11:16:07
 */

const fs = require("fs")

const R = require('../Runtime')

const LEVELS = ['log','trace','debug','info','warn','error']

const format = [
    "{{timestamp}} {{title}} : {{message}}", //default format
    {
        error: "{{timestamp}} {{title}} : {{message}}\n{{stack}}" // error format
    }
]
const dateformat = R.isDev? "HH:MM:ss.L":"yyyy-mm-dd HH:MM:ss.L"

const buildLogger = (withFile=true)=>{
    // let transport = !R.isDev ? undefined : d=>colorL[LEVELS[d.level]](d.message)
    //创建 logs 目录
    const _dir = R.dataDir("logs")
    if(withFile)
        fs.existsSync(_dir) || fs.mkdirSync(_dir, {recursive: true})

    var logger = withFile?
        require('tracer').dailyfile({
            root:_dir,
            // allLogsFileName:"meta",
            logPathFormat:"{{root}}/{{date}}.log",
            format: format,
            level: R.isDev? "debug": "info",
            dateformat: dateformat,
            // preprocess: function (data) {
            //     data.title = data.title.toUpperCase();
            // },
            transport: undefined
        })
        :
        require("tracer").colorConsole({
            format: format,
            dateformat: dateformat,
            preprocess: function (data) {
                data.title = data.title.toUpperCase();
            }
        })
    return logger
}

// 测试环境下只使用 控制台Logger
module.exports = buildLogger(!R.isDev)
