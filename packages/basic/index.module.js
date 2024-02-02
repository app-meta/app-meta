import CryptoJS from 'crypto-js'

/**
 * 补充到16的倍数，使用 NUL 补充
 * @param {String} text 待补充的字符串
 */
let padTo16 = (text)=>{
    let utf8length = encodeURI(text).split(/%..|./).length - 1;
    if (utf8length % 16 === 0) return text;
    // 填充 NUL 实现填 0 补位的效果
    return text + (new Array(16 - utf8length % 16)).fill(String.fromCharCode(0)).join('');
}

const nulReg = new RegExp(String.fromCharCode(0), "g")

export const aes = {
    /**
    * 使用 AES/CBC/NoPadding 方式加密数据
    * @param {*} data
    * @param {*} key
    * @param {*} iv
    * @returns 返回base64
    */
    encrypt : (data, key, iv) => {
        let encrypted = CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(padTo16(data)),         //编码 data，补全到 16 倍数
            CryptoJS.enc.Utf8.parse(key),                   //编码 key
            {
                iv: CryptoJS.enc.Utf8.parse(iv || key),       //编码 iv，若不提供则使用 key
                mode: CryptoJS.mode.CBC,                    //加密模式为CBC，补码方式为NoPadding
                padding: CryptoJS.pad.NoPadding,
            }
        );
        return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
    },

    decrypt : (data, key, iv)=>{
        // const base64 = CryptoJS.enc.Base64.parse(data)
        const decrypt = CryptoJS.AES.decrypt(
            data,
            CryptoJS.enc.Utf8.parse(key),
            {
                iv: CryptoJS.enc.Utf8.parse(iv||key),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.NoPadding
            }
        )
        //删除 NUL 字符
        return decrypt.toString(CryptoJS.enc.Utf8).replace(nulReg, "")
    },

    /**
     * 生成长度为 16 的包含数字（占比 20%）、大小写字母的密钥
     * @param {*} len
     * @returns
     */
    createKey : (len=16)=>{
        const key = []
        for (let i = 0; i < len; i++) {
            let random = Math.random()
            let type = random > 0.2? (random>0.6? 2: 1) : 0
            let start = type == 0 ? 48: type==1? 65: 97
            key.push(String.fromCharCode(start + Math.floor(Math.random() * (type==0?10:26))))
        }
        return key.join('')
    }
}


/**
 *
 * @param {*} origin
 * @param {*} limit     转换次数
 * @returns
 */
export const toBase64 = (origin, limit=1)=>{
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
export const fromBase64 = (text, limit=1)=>{
    for (let i = 0; i < limit; i++) {
        text = decodeURIComponent(atob(text)) //Buffer.from(text, 'base64').toString("utf-8")
    }
    return text
}
