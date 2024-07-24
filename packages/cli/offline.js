/*
 * @Author: 集成显卡
 * @Date: 2023-05-26 16:16:40
 * @Last Modified by:   集成显卡
 *
 * 构建离线包
 * 将打包后的离线包解压到任意机器，执行 npm link 即可安装
 */

import AdmZip from 'adm-zip'

const zip = new AdmZip()

const pkg = {
    "name": "meta",
    "author": "0604hx <zxingming@foxmail.com>",
    "bin": "meta.cjs"
}

zip.addLocalFile("dist/meta-cli.cjs", undefined, "meta.cjs")
zip.addFile("package.json", JSON.stringify(pkg, null, 4))

// get everything as a buffer(zip.toBuffer()) or write everything to disk
zip.writeZip("meta-cli-offline.zip", e=> {
    console.debug("离线包制作完成 ^.^")
})
