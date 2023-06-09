/*
 * @Author: 集成显卡
 * @Date: 2022-02-07 15:12:36
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-02-21 15:22:08
 */
const { existsSync, statSync, readFileSync, mkdirSync, writeFileSync } = require("fs")
const { resolve } = require('path')

const C = require("../Config")
const R = require("../Runtime")
const D = require("./date")
const logger = require("./logger")

module.exports ={
    /**
     * 同步方式读取稳定
     * @param {*} file
     * @returns
     */
    loadText (file) {
        return readFileSync(file, {encoding: C.encoding})
    },

    /**
     * 保存数据到文件（注意：此方法采用的强制覆写文件方式）
     * @param {*} name
     * @param {*} content       内容，如果是 Object 则转换为 JSON
     * @param {*} encoding      编码
     */
    saveFile (name, content, encoding=C.encoding){
        writeFileSync(
            resolve(name),
            Buffer.isBuffer(content) || typeof(content)=='string'? content: this.toJSON(content, 4),
            { encoding }
        )
        logger.debug(`写入数据到文件 ${name}`)
    },

    isFile (file){
        return statSync(file).isFile()
    },

    /**
     * 跟据任务id获取数据保存路径（基于任务目录）
     */
    dir(sub) {
        let paths = [R.dataPath]
        if (sub)
            paths.push(sub)

        const _dir = resolve(...paths)
        existsSync(_dir) || mkdirSync(_dir, { recursive: true })
        return _dir
    },

    /**
     * 获取文件名（基于任务目录）
     */
    file(name, sub) {
        let dir = this.dir(sub)
        return resolve(dir, name)
    },

    /**
     * 判断某个文件或者目录是否存在
     * @param {*} file
     * @returns
     */
    exist (file){
        return existsSync(file)
    },

    /**
     * 指定文件必须存在，否则抛出异常
     * @param {*} file
     * @param {*} msg
     */
    needFile (file, msg){
        if(!existsSync(file))   throw Error(msg||`文件资源 ${file} 不存在`)
    },

    /**
     * 给定的对象或者属性不能为空
     * @param {*} obj
     * @param {*} msg
     */
    need (obj, msg='对象必须有值'){
        if(typeof(obj) === 'object'){
            (Array.isArray(msg)? msg: [msg]).some(k=> {
                if(!obj[k])
                    throw Error(`属性 ${k} 不能为空`)
            })
        }
        else{
            if(!obj)    throw Error(msg)
        }
    },

    /**
     * 转换成 JSON 格式的字符串，屏蔽 null 或者 undefined 的属性
     *
     * obj：     待转换对象
     * space：   格式化输出时，行首空格数
     */
    toJSON (obj,space){
        return JSON.stringify(obj, (k,v)=>{if(!!v) return v; else undefined}, space)
    },

    /**
     * 复制非函数属性
     * @param {*} obj
     * @param Array fields
     * @returns
     */
    copyWithNotFunction (obj, fields=[]){
        let o = {}
        Object.keys(obj).forEach(k=>{
            if(typeof(obj[k]) != 'function' && (fields.length == 0 || fields.includes(k)))
                o[k] = obj[k]
        })
        return o
    },

    /**
     * 对比两个日历化版本的大小，如果相等则返回 0， 前者大于（日期更大）后者返回 1 反之返回 -1
     * @param {*} v1
     * @param {*} v2
     * @returns
     */
    compareVersion (v1="", v2=""){
        if(v1==v2)  return 0

        let vv1 = v1.split(".")
        let vv2 = v2.split(".")
        return vv1.some((v,i)=> (isNaN(v)?0:parseInt(v)) > (isNaN(vv2[i])?0:parseInt(vv2[i])))?1:-1
    },

    /**
     * 构建附件存储地址（相对地址），如果 filename 为空则只返回 attach 目录（注意，此时不自动创建目录）
     * @param {*} uuid
     * @param {*} filename
     */
    getAttachPath (uuid, filename){
        let p = C.attachPath.replace(/{uuid}/g, uuid||R.appName).replace(/{date}/g, D.compact("YYYYMMDD"))
        if(!filename)   return R.dataDir(p)
        return this.file(filename,  p)
    },

    /**
     * 获取任务目录，如果 filename 为空则返回相对根目录
     * @param {*} uuid
     * @param {*} filename
     * @returns
     */
    getWorkerPath (uuid, filename) {
        let workerDir = C.workerPath.replace(/{uuid}/g, uuid)
        if(!filename)   return R.dataDir(workerDir)
        return this.file(filename, workerDir)
    },

    getDababaseFile (name){
        return this.file(name, R.dataDir("db"))
    }
}
