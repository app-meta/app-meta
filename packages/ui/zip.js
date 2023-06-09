/**
 * 对打包后的文件夹进行压缩
 * Created by zengxm on 2017/5/28.
 */
const fs = require('fs')
const archiver = require("archiver")
const path = require('path')
const C = require('crypto')

const pkg = require("./package.json")

const dist = './dist'
const assetsDir = "static/js"          // 默认 assets
const zipFile = "./www.zip"

let md5 = v=> C.createHash('md5').update(v, 'utf-8').digest('hex')
//默认只签名 js/app.xxxx.js
let md5AppJSFile = (regx=/index\./)=>{
    let now = new Date
    let data = md5(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`)
    //部署到网关的应用名称，注意必须以 @@ 开头（标识符）
    let appName = `@@${pkg.name.replace(/-ui$/,"")}`
    data = md5(md5(appName)+data)
    let signs = [`${appName} ${data}`]
    fs.readdirSync(path.resolve(dist, assetsDir)).forEach(f=>{
        if(!f.match(regx))  return

        let content = fs.readFileSync(path.resolve(dist, assetsDir, f))
        data = md5(md5(content)+data)
        signs.push(`${assetsDir}/${f} ${data}`)
    })

    fs.writeFileSync(`${dist}/SIGN`, signs.join("\n"))
    console.log(`MD5签名信息(${regx})写入成功：`)
    signs.forEach(s=>console.log(`\t${s}`))
}

//如果需要签名全部 js 文件，请使用： md5AppJSFile(/./)
md5AppJSFile(/(index\.)|(chunk-vendors)/)

const outputFile = fs.createWriteStream(zipFile)

var archive = archiver('zip', {
    zlib: { level: 9 }
})

// listen for all archive data to be written
outputFile.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file is:'+outputFile.path);
    outputFile.end()
});

// good practice to catch this error explicitly
archive.on('error', function(err) {
    throw err;
});

archive.pipe(outputFile)
archive.directory(dist, false)

console.log("开始压缩前端文件："+dist)
archive.finalize()
