const NodeRSA = require("node-rsa")


const encryptionScheme = "pkcs1"

module.exports = {
    encrypt (data, publicKey) {
        const pubKey = new NodeRSA(publicKey, 'pkcs8-public')
        //设置与后端一致的加密方式 pkcs1
        pubKey.setOptions({ encryptionScheme })
        return pubKey.encrypt(Buffer.from(data), 'base64')
    },

    decrypt (data, privateKey){
        const priKey = new NodeRSA(privateKey, 'pkcs8-private')
        priKey.setOptions({ encryptionScheme })
        return priKey.decrypt(Buffer.from(data, 'base64'), 'utf8')
    },

    sign (data, privateKey){
        const priKey = new NodeRSA(privateKey, 'pkcs8-private')
        return priKey.sign(Buffer.from(data)).toString('base64')
    },

    verify (data, signature, publicKey){
        const pubKey = new NodeRSA(publicKey, 'pkcs8-public')
        return pubKey.verify(data, Buffer.from(signature, 'base64'))
    }
}
