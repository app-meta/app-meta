/**
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
export const createRobot = ({
    windowWidth     : 1280,
    windowHeight    : 720,
    snapshot        : false,
    merge           : true,
    timeout         : 180,
    headers         : "",
    delay           : 2,
    url             : "",
    code            : ""
})
