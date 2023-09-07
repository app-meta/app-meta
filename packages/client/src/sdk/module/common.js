const { clipboard } = require("electron");
const { verbose } = require("../../Runtime");
const logger = require("../../common/logger");

module.exports ={
    /**
     *
     * @param {String} text
     */
    'toClipboard'  : text=> {
        clipboard.writeText(text)
        verbose && logger.info(`写入到粘贴板：${text}`)
    },
    /**
     *
     * @returns
     */
    'fromClipboard': ()=> clipboard.readText()
}
