/*
 * @Author: 0604hx/集成显卡
 * @Date: 2022-03-20 22:39:28
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-09-07 11:22:00
 *
 * 本工具类主要是提供组件创建功能
 *
 * 参考文章：https://jackchoumine.github.io/vue3/render%E5%87%BD%E6%95%B0.html#%E5%9F%BA%E6%9C%AC%E7%94%A8%E6%B3%95
 */

import { h } from "vue"
import { sortBy } from 'lodash'

import { aes } from "@app-meta/basic"


window.H = window.H || {
    ...IS,
    /**
     * 获取指定对象（转换为 JSON 字符串后）的 哈希 值
     * @param {*} obj
     * @param {*} caseSensitive
     * @returns
     */
    hashCode (obj = null, caseSensitive = false) {
        obj = JSON.stringify(obj)
        if (!caseSensitive) obj = obj.toLowerCase()

        var hash = 100000000, i, ch
        for (i = obj.length - 1; i >= 0; i--) {
            ch = obj.charCodeAt(i)
            hash ^= ((hash << 5) + ch + (hash >> 2))
        }

        return (hash & 0x7FFFFFFF)
    },
    /**
    * 格式化文件大小
    * @param {*} mem
    */
    filesize(mem, fixed=1, split=" ") {
        var G = 0
        var M = 0
        var KB = 0
        mem >= (1 << 30) && (G = (mem / (1 << 30)).toFixed(fixed))
        mem >= (1 << 20) && (mem < (1 << 30)) && (M = (mem / (1 << 20)).toFixed(fixed))
        mem >= (1 << 10) && (mem < (1 << 20)) && (KB = (mem / (1 << 10)).toFixed(fixed))
        return G > 0
            ? G + split + 'GB'
            : M > 0
                ? M + split + 'MB'
                : KB > 0
                    ? KB + split + 'KB'
                    : mem + split + 'B'
    },
    /**
     * 判断是否为有效数字
     * @param {*} value
     * @returns
     */
    isNumber (value){
        return !isNaN(parseFloat(value)) && isFinite(value)
    },
    html (html){
        return ()=>h('div', {innerHTML: html })
    },
    /**
     * 打开新页面（同源）
     * @param {*} target
     */
    open (target, ps={}){
        ps = Object.assign(
            {
                title:"",
                width:1320,
                height:720,
                type:"_blank",
                center: false         //是否居中
            },
            ps
        )
        let options = `width=${ps.width},height=${ps.height}`
        if(ps.center) {
            let top = (window.screen.availHeight - ps.height)/2
            let left = (window.screen.availWidth - ps.width)/2
            options+=`,top=${top},left=${left}`
        }
        let newWin = window.open(target, "_blank", options)
        if(!!ps.title && !!newWin){
            newWin.onload = function(){
                newWin.document.title = ps.title
            }
        }
        return newWin
    },
    /**
     *
     * @param {*} name
     */
    setTitle (name){
        document.title = name + " · " + _APPNAME_
    },

    //集成 lodash
    sortBy: sortBy
}

H.aes   = aes

export default H
