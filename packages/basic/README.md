# 通用组件/函数

## 数据加解密
> secret

### AES
> secret/aes.js

集成`crypto-js`实现的 AES 加解密（加密模式为CBC，补码方式为NoPadding）

函数名|参数|说明
-|-|-
encrypt|(data, key, iv)|对文本 data 进行加密
decrypt|(data, key, iv)|对密文 data 进行解密
createKey|(len=16)|生成密钥（默认长度为 16）
