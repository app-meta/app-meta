import { h } from 'vue'
import { Markdown, Table, ChartBar, Font } from "@vicons/fa"

import { CHART, TABLE, TEXT, PIN } from "."

import ChartRender from "./widget-chart.vue"
import TableRender from "./widget-table.vue"
import TextRender from "./widget-text.vue"
import PinRender from "./widget-pin.vue"

export const renderItem = item =>{
    return h(
        item.widget==CHART?   ChartRender:
        item.widget==TABLE?   TableRender:
        item.widget==TEXT?    TextRender:
        item.widget==PIN?     PinRender:
        null,
        item
    )
}

const _buildAttrs = (appends=[])=>{
    let attrs = [
        { label:"卡片标题", id:"title", widget: "INPUT"},
        { label:"所占列数", id:"col", widget: "NUMBER", min:1, max: 3, suffix:"列", value: 1 },
        { label:"卡片高度", id:"height", widget:"NUMBER", min:50, max:1000, suffix:"px"},
        { label:"数据源", id:"origin", widget:"SELECT", options:["const|常量或JSON", "func|脚本计算（Promise）", "url|远程 URL 获取"], summary:"脚本时通过 resolve 返回数据对象" },
        { label:"数据值", id:"data", widget:"INPUT", rows: 4 }
    ]
    if(appends.length)  attrs.push(...appends)
    return attrs
}

const itemAttrs = {}
itemAttrs[TEXT]     = _buildAttrs()
itemAttrs[TABLE]    = _buildAttrs()
itemAttrs[CHART]    = _buildAttrs([
    { label:"工具栏", id:"toolbox", widget:"SWITCH", summary:"是否在图表右上方显示工具栏" },
    { label:"图表类型", id:"type", widget:"SELECT", options:["line|折线图/LINE", "bar|柱状图/BAR", "pie|饼图/PIE"] },
    { label:"更新模式", id:"mode", widget:"SELECT", options:["update|常规", "option|完整Option"], summary:"完整 Option 请参考 Echarts 官网的配置项" }
])
itemAttrs[PIN]      = _buildAttrs([
    { label:"后缀字符", id:"suffix", widget:"INPUT" },
    { label:"配色", id:"theme", widget:"SELECT", options:["default|DEFAULT-默认", "success|SUCCESS-成功", "info|INFO-信息", "warning|WARN-警告", "error|ERROR-错误"] }
])

export { itemAttrs }

export const itemTypes = [
    { id:TEXT, label:"富文本展示", icon: Markdown, theme:"info"},
    { id:TABLE, label:"二维表格", icon: Table, theme:"success"},
    { id:CHART, label:"可视化图表", icon: ChartBar, theme:"warning", create: ()=>({mode:"update", type:"line", toolbox:true})},
    { id:PIN, label:"大字报", icon: Font, theme:"info", create:()=>({suffix:"", col:1, height:0, theme:"default", data:"内容"}) }
]

export const createItemMenuOpts = (key="")=> itemTypes.map(v=>({
    key:`${key?(key+"-"):""}${v.id}`,
    id: v.id,
    label:v.label,
    create: v.create,
    icon: UI.buildIcon2(v.icon, {class: v.theme})
}))
