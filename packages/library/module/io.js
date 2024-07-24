import { parse } from 'papaparse'
import Mustache from "mustache"
import { gzip, ungzip } from 'pako'

const RN = "\n"
const fixToCsv = v=>{
    if(Array.isArray(v))
        return `"${v.join(RN).replace(/"/g, "`")}"`
    if(typeof(v)==='string')
        return `"${v.replace(/"/g, "`")}"`
    return v
}

const showIOError = (e, file={name:""})=> window.M && window.M.showError(`<div>${e.message}</div><div class="mt-4 text-xs">文件名：${file.name}</div>`, "文件读写错误")

/**
 * 保存内容到文件
 * @param {*} blob
 * @param {*} fileName
 */
function saveToFile(blob, fileName = "下载文件.txt") {
    if (!(!!blob && blob.toString() == '[object Blob]')) {
        blob = new Blob([blob])
    }
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)    // 创建下载的链接
    link.download = fileName                        // 下载后文件名
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()                                    // 点击下载
    window.URL.revokeObjectURL(link.href)           // 释放掉blob对象
    document.body.removeChild(link)                 // 下载完成移除元素
}

/**
 * 保存到 CSV 默认编码为 UTF-8
 * @param {*} obj
 * @param {*} fileName
 */
function saveToCSV(obj, fileName = "下载文件") {
    let csvText = ""
    //参数为数组的情况
    if(Array.isArray(obj)){
        csvText = Array.isArray(obj[0])? obj.map(v=>v.map(fixToCsv).join(",")).join("\n"): obj.join("\n")
    }
    else if(typeof(obj) === 'object'){
        let { headers, rows } = obj
        if(!headers && !Array.isArray(headers)) throw Error(`[CSV导出] Object 类型的参数必须传递 headers 属性`)
        //写入标题栏
        csvText += headers.map(h=> typeof(h)==='object'?h.text:h).join(",") + RN

        let headerIds = headers.map(h=> typeof(h)==='object'? h.key:h)
        rows.forEach((row,rIndex)=>{
            csvText += headerIds.map(id=>fixToCsv(row[id])).join(",") + RN
        })
    }
    else if(typeof(obj) === 'string')
        csvText = obj

    saveToFile(new Blob([csvText], { type: "application/csv;charset=utf-8" }), `${fileName}.csv`)
}

const read = file=> new Promise((ok)=>{
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onload   = e => ok(e.target.result)
    reader.onerror  = e => showIOError(e, file)
})

/**
 * https://www.papaparse.com/docs
 *
 * @param {*} text
 * @param {*} split
 * @param {*} header
 * @returns
 */
const _readCSVFromString = (text, split, header, cb)=> parse(text, {
    delimiter:split,
    header,
    complete :result=>{
        if(result.errors.length)
            showIOError(result.errors.map(v=>v.message).join("<br>"))
        else
            cb(result.data)
    }
})

const readCSV = (fileOrText, header=false, split=",") => new Promise((ok)=>{
    if(typeof(fileOrText) === 'string'){
        _readCSVFromString(fileOrText, split, header, ok)
    }
    else {
        let reader = new FileReader()
        reader.readAsText(fileOrText)
        reader.onload   = e => {
            _readCSVFromString(e.target.result, split, header, ok)
        }
        reader.onerror  = e => showIOError(e, fileOrText)
    }
})

export { saveToCSV, saveToFile, read, readCSV }

// export const renderTemplate = (tpl, model)=> render(tpl, model)

export const render = (tpl, model)=> Mustache.render(tpl, model)

/**
 * 弹窗选择并读取文件
 * @param {*} accept    文件类型，默认是全部类型；格式参考 *.xlsx
 * @param {*} dataType  读取方式，可选值：null（或空，返回 File 对象）、text、base64
 * @param {*} maxSize   文件大小上限，单位 MB
 * @returns
 */
export const chooseAndRead = (accept=".*", dataType="text", maxSize= 2)=> new Promise((ok, fail)=>{
    //使用原生 JS 选择文件
    let input = document.createElement("input")
    input.type = 'file'
    input.accept =accept
    input.click()
    input.onchange = e=>{
        let file = e.target.files[0]
        if(!!file){
            if(file.size >= maxSize * 1024 * 1024)  return fail(`${file.name}超出大小限制（${maxSize} MB）`)

            if(!!dataType){
                let reader = new FileReader()
                reader.onload = ee=>{
                    let { result } = ee.target
                    ok({filename: file.name, result})
                }

                dataType == 'base64'?reader.readAsDataURL(file):reader.readAsText(file)
            }
            else
                ok(file)
        }
    }
})

/**
 *
 * @param {*} file
 * @param {*} ps
 * @returns
 */
export const readFile = (file, ps={dataType:"JSON", sheet:0})=>{
    let ext = file.name.toUpperCase().split(".").pop()
    let useArray = ps.dataType == "ARRAY"

    if(ext ==='XLSX')   return H.excel.readToJSON(file, ps.sheet, {header:useArray?1:undefined})
    if(ext === 'TXT')   return read(file).then(ok)
    if(ext === 'CSV')   return readCSV(file, !useArray, ",")

    throw Error(`仅支持读取 xlsx、txt、csv 格式的文件`)
}

//====================================== START 文本压缩 START ======================================
//参考 https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
//注意，此处用了 btoa、atob 函数，仅适用于浏览器端
/*
// 服务端（Kotlin）的加解压代码

fun compress(text:String?): String {
    if(text.isNullOrEmpty())  return ""

    ByteArrayOutputStream().use { out->
        val gzip = GZIPOutputStream(out)
        gzip.write(text.toByteArray())
        gzip.close()

        return String(Base64.getEncoder().encode(out.toByteArray()))
    }
}
fun unCompress(text: String):String {
    ByteArrayOutputStream().use { out->
        ByteArrayInputStream( Base64.getDecoder().decode(text)).use { bin->
            val gzip    = GZIPInputStream(bin)
            val bs      = ByteArray(256)

            var n: Int
            // 将未压缩数据读入字节数组
            while (gzip.read(bs).also { n = it } >= 0) {
                out.write(bs, 0, n)
            }
        }
        return out.toString()
    }
}
 */

const CHUNK_SZ = 0x8000;
const Uint8ToString = u8a => {
    var c = []
    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)))
    }
    return btoa(c)
}
const StringToUint8 = b64encoded=>new Uint8Array(atob(b64encoded).split("").map(c=>c.charCodeAt(0)))

export const compress = text=> Uint8ToString(gzip(typeof(text)==='string'? text : JSON.stringify(text)))

export const unCompress = text=> ungzip(StringToUint8(text), {to: 'string'})
//====================================== FINISH 文本压缩 FINISH ======================================
