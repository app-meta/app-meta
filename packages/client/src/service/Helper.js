const urlPrefix = process.env.WEBPACK_DEV_SERVER_URL? process.env.WEBPACK_DEV_SERVER_URL:"app://./"
const preload   = join(__dirname, '../preload/api-main.js')

/**
 * 构建 URL，返回字符串（区分开发环境与生产环境）
 * @param {*} suffix    后缀，注意，需要带上 /
 * @param {*} page      页面（多页面应用时需要传递）
 */
exports.buildUrl = (suffix="", page="index.html")=>{
    return `${urlPrefix}${page}${suffix}`
}
