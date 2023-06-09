# 加解密工具合集

* `AES` CBC/NoPadding 模式
* `RSA` pkcs8 格式

```javascript
// 另存为 test.js
// 通过 node test.js 来执行

const AES = require("./aes")
const RSA = require("./rsa")

let content = "你好，我是集成显卡！FROM 2022-03-29"

if(process.argv.length > 2 && process.argv[2].toUpperCase() == "RSA"){
    console.group("RSA 测试")
    let pubKey = `-----BEGIN PUBLIC KEY-----
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDJw0UcM1BeX2I/+/dkRF+wjFxU
    JN1OM+8iRRKbyOLCt+GI2MgBUx36Fubk8Vb2xRw8A4uLCK0iUNiOL4qJQqH8Ksz8
    RNErw+N0NPUzV40BSjZbt6EV+iLqVj4khEzT+bpnzI2K1Mk6+Ygc+st3Xn+4lNqF
    lXmb0tnvccW7UK3uDwIDAQAB
    -----END PUBLIC KEY-----`
    let priKey = `-----BEGIN PRIVATE KEY-----
    MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAMnDRRwzUF5fYj/7
    92REX7CMXFQk3U4z7yJFEpvI4sK34YjYyAFTHfoW5uTxVvbFHDwDi4sIrSJQ2I4v
    iolCofwqzPxE0SvD43Q09TNXjQFKNlu3oRX6IupWPiSETNP5umfMjYrUyTr5iBz6
    y3def7iU2oWVeZvS2e9xxbtQre4PAgMBAAECgYBh7KReS4l2RFUrON+ZipXm2jj1
    ne7LRemKeHvPoHBukVClWpG4Et85wmPOOlQ68PADMLVJhayCOzrfx7M1a2GyZVuc
    coGSBN0xOmCEWOxjaUE43MbEfDNKJ/ZO09ch8rNJ/a6cbCsYJ+HVry4wi5XDizJD
    uuKrPSFGIiTvLO/IAQJBAOp8ZnEXf9+BRLuCx3Qfwj0dQl/3+oO4OgVA1NZQHIiP
    5CeJLIlL4aEhqbPp9M3bfg2J1X4C2TX0SjKfOVKH338CQQDcRkTYHpfAdlqNZIY1
    9s4SeB28nw2H/vvQumxxaoNWubxs7oZBpHYJo8QCV7m61AKiLpJePMNjGzBLKn02
    jzlxAkAxZ2RuD3Vxsdq5ZyR+4vIZzkBd1/GALyCKWs59GQPqAecgLVak1sgDGwSW
    U4Swmr5EO/YvRopdQ8seP03khZwhAkAuMPIY2/l4m5kLk2vtfw7hopyhxDzDKv5F
    XAKHmg1mr1ZLBY3T0BgMl3HwB9Nj0TeoKNn6twVGEBqFeKh/O3ORAkAu9XZAaKyk
    +7A7DD2/sVgnhZhpf/wDA5KKRpHm0JDWLH0IrHuYks5t05+5rCgIrybpzLhag45z
    EF6eeheaD3Ii
    -----END PRIVATE KEY-----`
    let pubKey2 = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCIaikO5hdxOHPTRgZw+0HidXXSCnoCjIRONGJEvKSW1wE+b4eGq/4Bv2Q+5CTIzM+lG/cfm0q0JtS9NdPMiAO/sc15hOFj2y47ijoUDYY1vi3UvQPDs+EWi7Nrya6gWbsdxeDKD3smWwUeArwx/zcj3boB2UpfrUfo9NFy8+NlvwIDAQAB"
    let priKey2 = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAIhqKQ7mF3E4c9NGBnD7QeJ1ddIKegKMhE40YkS8pJbXAT5vh4ar/gG/ZD7kJMjMz6Ub9x+bSrQm1L0108yIA7+xzXmE4WPbLjuKOhQNhjW+LdS9A8Oz4RaLs2vJrqBZux3F4MoPeyZbBR4CvDH/NyPdugHZSl+tR+j00XLz42W/AgMBAAECgYAnGptzcGTG6WJWbWvaRkQwKPChyawJAAPLMTv8LUFXFgH+xlTIt5PkJ1uSpa6fuwpI77fK4SasdrckGAKDTngYN17T4U8cmw697Y1So272x5cvuzoIcGycRNxTF8LoqYK6PszGQ3FQU3aPMrFESromdzO1PHulgKFWc6FVeSdCSQJBAKxDdvQKlqIXkOXHDaPfKQ7WSWuRVW1KgaTTr8OilZ+2TcOD3ECQWq+MeVstC+dpj5pE2Q3d3l/BFDRs7e3NmHkCQQDKuacZzV3CnoFuUDu0IqDOvRR5H+lQEKJizvlgjKjYrH5kHxbx0/eO18iJi+7e1IT2bgUOQ9KMhM5t26aLv1H3AkEAmwCRloG4jN2bmcYEdgGlVh5nLg01ywORqBh6PRScgXtueZC6rLW3g+JoiCv+XBnWB0AP9rQ/FfYMEig55xJqMQJAAVIiV5Wx9bGosDpPmUXcfFxZBM0DbSUembw1fb6M3xSIokhdkufJpiGbyeGihcsmrqBa4hPpDEdVPPwAYsq1UwJAVGccnPf/U6kyJ9lJNeNB8rjt05S87mDpL7yJMyc8+ltgEtm55Redh4yrXcOUVSx4kY0wDGFdL6sISlcP2yL4IQ=="
    let miwen =  RSA.encrypt(content, pubKey )
    console.info("加密：", miwen)
    console.info("解密：", RSA.decrypt(miwen, priKey))

    let sign = RSA.sign(content, priKey2)
    console.info("签名：", sign)
    console.info("验签：", RSA.verify(content, sign, pubKey2))
}
else{
    console.group("AES 测试（CBC/NoPadding）模式")
    let aesKey = "rNvU4jW8CednizmR"
    console.info("明文：", content)
    console.info("密钥：", aesKey, "（随机密钥="+AES.createKey()+"）")
    
    let miwen = AES.encrypt(content, aesKey)
    console.info("加密：", miwen)
    console.info("解密：", AES.decrypt(miwen, aesKey))
}
```
