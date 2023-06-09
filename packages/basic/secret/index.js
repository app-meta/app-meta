/**
 *
 * @param {*} origin
 * @param {*} limit     转换次数
 * @returns
 */
const toBase64 = (origin, limit=1)=>{
    for (let i = 0; i < limit; i++) {
        origin = btoa(encodeURIComponent(origin)) //Buffer.from(origin).toString("base64")
    }
    return origin
}

/**
 * 将 Base64 串还原到原始文本
 * @param {*} text
 * @param {*} limit     转换次数
 * @returns
 */
const fromBase64 = (text, limit=1)=>{
    for (let i = 0; i < limit; i++) {
        text = decodeURIComponent(atob(text)) //Buffer.from(text, 'base64').toString("utf-8")
    }
    return text
}


module.exports = { toBase64, fromBase64 }
