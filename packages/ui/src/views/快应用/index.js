import { ref, onMounted,onUnmounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { Table, ChartPie, Wpforms, Html5, ListAltRegular, Database, Tools, ExclamationTriangle, Server, Robot, FileWordRegular as DOC, Vuejs } from "@vicons/fa"

const INPUT     = "primary"
const OUTPUT    = "info"
const MIX       = "warning"

export const templateGroups = { primary:"数据采集", info:"展示页面", warning:"综合功能" }

/**
 * 对于特殊类型的页面，初始化 DATA 模块时无需设置其页面ID（方便自由读写任意类型的数据）
 * @param {*} pageType
 * @returns
 */
export const isUnLimitPageId  = pageType=> [ "import", "table", "chart" ].includes(pageType)

/**
 * theme 为 primary 表示数据录入为主、info 为展示
 */
export const templates = [
    { id:"form", text:"表单页", theme: INPUT, icon: Wpforms, summary:"数据填报页面，支持可视化编辑"},
    { id:"markdown",text:"文档页", theme: OUTPUT, icon:DOC, summary:"基于 MARKDOWN 的内容展示"},
    { id:"data",text:"数据分发", theme: INPUT, icon:Database, summary:"批量导入数据并按照设定的规则分发给指定人"},
    { id:"import",text:"数据维护", theme: INPUT, icon:Tools, summary:"数据内容维护（自定义脚本处理用户导入的文件）"},
    { id:"wenjuan",text:"调查问卷", theme: INPUT, icon:ListAltRegular, summary:"运用统一设计的问卷向被调查者了解情况或征询意见收集信息的调查方法"},
    { id:"table",text:"数据表格", theme: OUTPUT, icon:Table, summary:"以二维表格的形式展示数据，支持多条件筛选、自定义列"},
    { id:"chart",text:"统计图表", theme: OUTPUT, icon:ChartPie, summary:"用于制作台账、统计图等数据可视化页面"},
    { id:"robot",text:"RPA机器人", theme: MIX, icon: Robot, summary:"基于 WEB 的 RPA 机器人（主要用于数据采集，需要目标网站支持 Chrome 浏览器）"},
    //SFC add on 2023-06-02
    { id:"sfc",text:"单文件组件", theme: MIX, icon: Vuejs, summary:"自定义Vue3页面（template+script+style），能够使用全局组件及接口"},
    { id:"h5",text:"H5小程序", theme: MIX, icon: Html5, summary:"自由灵活的 HTML5 页面（适用于具备开发能力的技术人员）"},
    { id:"server",text:"后端服务", theme: MIX, icon: Server, summary:"部署在服务器的后端服务（目前仅支持 Node.js 开发语言）", onCreate:aid=>({name:`ENDPOINT-SERVICE`, search:false})},
]
export const findTemplate = tpl=> templates.find(v=>v.id==tpl) || {text:"未知", theme:"error", summary:`未知的模板类型⌈${tpl}⌋`, icon:ExclamationTriangle }

/**
 * 渲染器属性
 */
export const renderProps = {
    aid: {type:String, default:""},
    page: {type:Object},
    pid:{type:[Number, String], default:""},
    data: {type:String, default:"[]"},
    params: {type:Object, default:()=>({})}
}

export function pageManage(router){
    let toView = row=>{
        if(row.template == 'robot')
            return M.confirm(`运行机器人`, `确定执行网页机器人⌈${row.name}⌋吗？`, ()=> H.app.runRobot(row.id))
        let r = router.resolve({name:`app-view`, params:{aid:row.aid, pid: row.id}})
        H.openUrl(r.href, {title: row.name, center:true })
    }

    let toEdit = row=>{
        let r = router.resolve({name:`app-page-${row.template}`, params:{id:row.id, aid:row.aid}})
        let width = Math.floor(window.screen.availWidth * 0.9)
        let height = Math.floor(window.screen.availHeight * 0.8)
        H.openUrl(r.href, {title:`${row.name}·编辑页面`, center:true, width, height })
    }

    return { toView, toEdit }
}

export function pageEditor(defaultVal, translator, padding=true){
    let {id, aid}   = useRoute().params
    let bean        = ref(defaultVal)
    let loading     = ref(false)
    let inited      = ref(false)

    const PADDING   = "main.padding"

    let refresh = ()=> GET("/page/content", {id}, d=> {
        if(d.success===true){
            if(!!d.data)
                bean.value = translator?translator(d.data):d.data

            inited.value = true
        }
        else {
            alert(d.message)
            window.close()
        }
    })

    let updateContent = (value, onOk)=> RESULT(
        "/page/content",
        {id: parseInt(id), value},
        d=> typeof(onOk) === 'function'? onOk(d) : M.notice.ok(`页面内容更新完成`),
        {loading}
    )
    onMounted(()=>{
        padding && E.emit(PADDING, 0)
        refresh()

        if(!H.data.getAppId()){
            // 初始化 DATA 模块，此处不传递 pid 参数，需要在 CURD 时进行手动 pid 限定
            H.data.init({aid, pid:"", prefix: window.SERVER, debug: process.env.NODE_ENV !== "production"})
        }
    })
    onUnmounted(()=>{
        padding && E.emit(PADDING)
    })

    return { id,aid, loading, bean, inited, refresh, updateContent }
}

export const loadPages = (aid, loading)=> new Promise((ok)=> RESULT("/page/list", {form:{EQ_aid:aid}}, d=> ok(d.data), {loading}))

export const loadContent = id => new Promise((ok, fail)=> GET("/page/content", {id}, ok, fail))

/**
 * 注册全局的 CTRL+S 事件
 * @param {String} key 'KeyS'
 */
export const initCtrlAndS = (handler, keyName="s")=>{
    document.onkeydown = e => {
        let {ctrlKey, key} = e
        if(ctrlKey==true && key==keyName){
            e.preventDefault()
            handler && handler()
        }
    }
}

/**
 *
 * @param {Object} row
 * @param {String} key
 * @param {*} value
 * @param {String} tip
 * @returns
 */
export const modifyPage = (row, key, value, tip="操作成功")=> new Promise(ok=> RESULT("/page/modify", {id: row.id, key, value}, d=> {
    window.M.ok(tip)
    row[key] = value
    ok()
}))


export const toView = id=>{
    const router = useRouter()
    console.debug(router)
}
