const { aes } = require("@app-meta/basic")

console.debug(aes.createKey())
let key     = "34dhPTk21b64Jsza"

let texts = ["ABC", "123Abc","集成显卡"]

texts.forEach(text=>{
    let msg     = aes.encrypt(text, key)
    console.debug(`密文：${msg}`)
    console.debug(`明文：${aes.decrypt(msg, key)}`)
})
