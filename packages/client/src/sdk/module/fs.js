const { dialog } = require("electron")
const { existsSync, statSync, readFileSync, mkdirSync, writeFileSync } = require("fs")

const logger = require("../../common/logger")

/**
 * 读取指定路径文件的文本内容（自动判断 gbk 或者 utf-8）
 * 如果指定路径不存在，则返回 undefined
 * @param {*} path
 * @returns
 */
function _loadText(path){
    if(!existsSync(path))   return undefined

    let content = readFileSync(path)

    // if(jschardet.detect(content).encoding != jschardet.EnumEncoding.UTF8 )
    //     return jschardet.decode(content, jschardet.EnumEncoding.GBK)

    return content.toString('utf-8')
}

module.exports ={
    /**
     * 读取指定路径的文件内容
     * 最后一个参数为编码，默认 utf-8
     *
     * https://nodejs.org/dist/latest-v18.x/docs/api/buffer.html#buffers-and-character-encodings
     * @param  {...any} ps
     */
    'readText': (...ps)=> ps.map(p=> _loadText(p)),

    /**
     *
     * @param {*} path      文件路径
     * @param {*} content   内容
     * @param {*} encoding  编码
     */
    'writeText': (path, content, encoding="utf-8")=> {
        writeFileSync(path, content, { encoding })
        logger.info(`写入文件 ${path} (encoding=${encoding})`)
    },

    /**
     * 选择文件或者目录
     *
     * filters 示例
        [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
            { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
            { name: 'Custom File Type', extensions: ['as'] },
            { name: 'All Files', extensions: ['*'] }
        ]
     *
     * @param {*} type      类型,0=文件,1=目录
     * @param {*} title     对话框标题
     * @param {*} filters   筛选规则,详见  https://www.electronjs.org/docs/latest/api/structures/file-filter
     * @returns
     */
    "select": (type=0, title, filters=[{name:"所有文件", extensions: ['*']}])=>{
        title = title || type==0?'选择文件':'选择目录'

        let result = dialog.showOpenDialogSync({
            title,
            filters: type==0?[]:filters,
            properties: type==0?['openFile','createDirectory'] : ['openDirectory','createDirectory']
        })
        return result? result[0] : undefined
    },
}
