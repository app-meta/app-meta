const SPLITS = [",","|","，","、"]

export const FAST_APP   = 0
export const WEB_RPA    = 1
export const EXTRA_APP  = 2

const categories = [
    { name:"快应用", value: FAST_APP, summary:"基于平台提供的模块快捷创建数据应用", theme:"primary" },
    { name:"外置应用", value: EXTRA_APP, summary:"", theme:"warning", disabled:true }
]

export { categories }
export function getCategory(c){
    return categories.find(v=>v.value==c) || {name:`未知类型`, value:c, theme:'error'}
}

//TEXT（文本）、DATE（日期）、SELECT（下拉框）、RADIO（单选）、SWITCH（开关）、HIDE（隐藏项）、INFO（描述信息）
export const Forms = [
    { label:"文本", value:"TEXT" },
    { label:"日期", value:"DATE" },
    { label:"下拉框", value:"SELECT" },
    { label:"单选", value:"RADIO" },
    { label:"开关", value:"SWITCH" },
    { label:"文件选择", value:"FILE"},
    { label:"隐藏项", value:"HIDE" },
    { label:"提示", value:"INFO" }
]

export function textToList(text){
    return text.split(",")
}
