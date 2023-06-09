/*
 * @Author: 0604hx/集成显卡
 * @Date: 2022-03-20 22:39:28
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-04-11 17:41:16
 *
 * 本工具类主要是提供组件创建功能
 *
 * 参考文章：https://jackchoumine.github.io/vue3/render%E5%87%BD%E6%95%B0.html#%E5%9F%BA%E6%9C%AC%E7%94%A8%E6%B3%95
 */

import { createVNode, h } from "vue"
import { RouterLink } from "vue-router"
import { NButton, NIcon } from "naive-ui"
import { sortBy } from 'lodash'

import { aes } from "@app-meta/basic"

let buildIcon= (icon, ps={})=>{
    return createVNode(NIcon, Object.assign({component: icon}, ps))
}
let buildIcon2 = (icon, ps)=> ()=> buildIcon(icon, ps)

/**
 * 创建按钮
 * @param {*} icon      图标，如果传递 string 则使用 fontawesome 图标
 * @param {*} text      文字
 * @param {*} onClick   回调事件
 * @param {*} ps        其他自定属性
 * @returns
 */
let Button = (icon, text, onClick, ps={})=>{
    return createVNode(
        NButton,
        Object.assign({onClick}, ps),
        ()=>{
            let tags = []
            if(!!icon)  tags.push(buildIcon(icon)) //
            if(!!text)  tags.push(text)
            return tags
        }
    )
}

window.H = window.H || {
    ...IS,
    /**
     * 构建图标
     * @param {*} icons
     * @param {*} spin
     * @returns
     */
    buildIcon,
    buildIcon2,
    Button,
    /**
     * 创建圆形仅含图标的按钮，默认值：size=small circle=true quaternary=true
     * @param {*} icon
     * @param {*} onClick
     * @param {*} ps
     * @returns
     */
    iconBtn (icon, onClick, ps={}){
        return Button(icon, null, onClick, Object.assign({ quaternary:true, circle: true, size: 'small'}, ps))
    },
    /**
     * 生成菜单项
     * @param {*} routeName 路由名称或者路由对象
     * @param {*} text      菜单文本
     * @param {*} icon      图标
     * @returns
     */
    menuItem (routeName, text, icon){
        let to = typeof(routeName)==='string'? { name: routeName }: routeName
        return {
            label: () => createVNode(RouterLink, { to }, ()=>text),
            key: to.name,
            icon: buildIcon2(icon)
        }
    },
    /**
     * 转换为 naive-ui 兼容的 SelectOption
     * @param {*} list
     */
    toOptions (list, disableFun=()=>false){
        return (Array.isArray(list)? list:[list]).map(v=>(
            {
                label:v,
                value:v,
                disabled: disableFun(v)
            }
        ))
    },
    /**
     * 构建适配于 naive-ui 的下拉框选择内容，示例：[{label:"选项一",value:"01"}]
     *
     * 参数 text 类型可以是 Array、String、Object
     *  Array   ["01|选项一","02|选项二"]
     *  String  01|选项一,02|选项二
     *  Object  {"01":"选项一", "02":"选项二"}
     *
     * 处理逻辑：
     *  1、将参数 text 转换为 Array<String>（key与value 用英文 | 隔开）
     *  2、遍历上述数组元素转换为 { label, value }
     *  3、若参数没有区分 key 跟 value 则二者相同
     *
     * @param {*} text
     * @param {*} valueField    默认为 value
     * @param {*} labelField    默认为 label
     */
    buildOptions (text, disableFun=()=>false) {
        let options = []
        if(!text)   return options

        if(Array.isArray(text))
            options = text
        else if(typeof(text) === 'string'){
            options = text.replace(" ", "").split(",")
        }
        else if(typeof(text) === 'object'){
            options = Object.keys(text).map(k=> `${k}|${text[k]}`)
        }
        else
            throw Error(`${text} 不是有效的 options 数据内容，请参考文档进行配置`)

        return options.map(o=> {
            let i = o.indexOf("|")
            let obj = {}
            if(i==-1)
                obj.value = obj.label = o
            else{
                obj.label =  o.substring(i+1)
                obj.value = o.substring(0, i)
            }
            if(typeof(disableFun) === 'function')
                obj.disabled = disableFun(obj)

            return obj
        })
    },
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
