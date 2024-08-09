<template>
    <n-data-table class="mt-2" :columns="columns" :loading="loading" :data="beans" striped :style="{height}" flex-height :bordered="true" />

    <AuthSelector ref="authRef" :value="authText" @ok="onAuthChange" :aid><span></span></AuthSelector>
    <DocumentManager ref="docRef"><span></span></DocumentManager>

    <n-dropdown
        placement="bottom-start"
        trigger="manual"
        :x="menu.x"
        :y="menu.y"
        :options="menuOpts"
        :show="menu.show"
        :on-clickoutside="()=> menu.show=false"
        @select="onMenuSelect"
    />
</template>

<script setup>
    import { ref,onMounted, h,nextTick, unref, toRaw, reactive, computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { NTag, NSwitch,NTooltip, NSpace, NButtonGroup } from 'naive-ui'

    import { Plus,Trash,Check, Edit, Eye, ShieldAlt, ShieldVirus, FileWord, Download, Upload, SyncAlt, EllipsisH as Ellipsis,PlaneDeparture, CopyRegular } from '@vicons/fa'

    import { templates, findTemplate, pageManage } from "./"
    import CreatePage from "./create-page.vue"
    import ClickInput from "@C/dbclick.input.vue"
    import Template from "../widget/page.template.vue"
    import AuthSelector from "@CC/selector.auth.vue"
    import DocumentManager from "./document-manage.vue"
    import Count from "@VW/count.vue"
    import AppSelector from "@VW/app.selector.vue"

    let aid = useRoute().params.id
    const router = useRouter()

    const { toView, toEdit } = pageManage(router)

    const isDisable = row=> row.template=='server'||row.template=='faas'
    let height = "calc(100% - 0px)"
    let align = "center"
    let columns = [
        { title:"序号", width:55, align, render:(row, i)=> h('span', {class:"cursor-pointer", title:"点击复制ID", onClick:()=> copyId(row) }, i+1)},
        {
            title:"标题", key:"name",
            render: row=> h(ClickInput, {
                class:"cursor-pointer",
                text:row.name, special:true,
                onUpdate:v=>modify(row, "name", v, `标题更改为：${v}`),
                onClick:()=>toView(row),
                title:`完整编号：${row.aid}/${row.id}（双击可编辑标题）`
            })
        },
        {
            title:"类型", key:"template", width: 100,
            render:row=> h(Template, {bean: findTemplate(row.template)}),
            filterOptions: templates.map(v=>({label:v.text, value:v.id})),
            filter: (v, row)=> row.template == v
        },
        {
            title:"可访问", key:"active", width:70,
            render:row=>h(
                NSwitch,
                {
                    defaultValue: row.active,
                    "on-update:value": v=>modify(row, 'active', v, `页面设置为⌈${v?"可见":"不可见"}⌋`),
                }
            )
        },
        {
            key:"main", width: 70,
            title:()=>h(NTooltip,{},{trigger:()=>h('div', {class:"cursor-pointer"}, "主页面"), default:()=>`主页面是运行应用的首页，点击下方的按钮可切换主页面（注意仅有一个主页面）`}),
            render:row=> h(
                NTag,
                {
                    class:"cursor-pointer",
                    round:true,
                    bordered:false,
                    type:row.main?"primary":"default", disabled: isDisable(row),
                    onClick:()=> !isDisable(row) && modify(row, "main", !row.main, `⌈${row.name}⌋已设置为${row.main?"普通":"主"}页面`)
                },
                ()=>row.main?"首页":"普通"
            )
        },
        {
            key:"search", width:70,
            title:()=>h( NTooltip,{},{ trigger:()=>h('div', {class:"cursor-pointer"}, "可检索"), default:()=>`仅当可访问、可检索均勾选才能被检索` } ),
            render:row=>h(
                NSwitch,
                {
                    defaultValue: row.search, disabled: isDisable(row),
                    "on-update:value": v=>modify(row, 'search', v, `页面设置为⌈${v?"":"不"}可检索⌋`),
                }
            )
        },
        { title:"热度", key:"launch", width: 60, render:row=> h(Count, {value: row.launch}) },
        { title:"更新日期", key:"addOn", width: 170, render: row=> H.date.datetime(row.addOn) },
        {
            width:140, align,
            title: ()=> h(NSpace, {justify:"center"}, ()=>[
                h(CreatePage, {aid, onAdd: refresh}),
                UI.iconBtn(Upload, ()=> toImport(), {type:"primary", quaternary:false, secondary:true, title:"从 JSON 文件中导入"}),
                UI.iconBtn(SyncAlt, refresh, {type:"primary", quaternary:false, secondary:true, title:"刷新列表数据"})
            ]),
            render(row, rowIndex) {
                return h(NButtonGroup,()=> [
                    UI.iconBtn(Eye, ()=> toView(row), {title:"浏览页面", disabled: isDisable(row), secondary:true }),
                    UI.iconBtn(Edit, ()=> toEdit(row), {title:"编辑页面", secondary:true}),
                    UI.iconBtn(Ellipsis, e=> showMenu(e, row, rowIndex), {secondary:true})
                ])
            }
        }
    ]

    let loading = ref(false)
    let beans   = ref([])

    let authRef = ref()
    let authText= ref("")
    let authType= ""

    let docRef  = ref()

    const menu = reactive({x:0, y:0, show:false, index:-1})
    let curRow = {}
    const menuOpts = [
        { label:"复制编号", key:"copyId", icon:()=>UI.iconBtn(CopyRegular)},
        { label:"权限分配",icon:()=>UI.iconBtn(ShieldAlt), key:"auth", children: [{label:"访问权限",key:"serviceAuth"}, {label:"修改/维护权限",key:"editAuth"}] },
        { label:"附件管理", key:"doc", icon:()=>UI.iconBtn(FileWord) },
        { label:"导出为 JSON", key:"download", icon:()=> UI.iconBtn(Download)},
        { label:"迁移到", key:"move", icon:()=> UI.iconBtn(PlaneDeparture)},
        { type: "divider" },
        { label:"删除", key:"delete", icon:()=> UI.iconBtn(Trash, null, {type:"error"}) }
    ]


    let refresh = ()=> RESULT("/page/list", {form:{EQ_aid:aid}}, d=> beans.value=d.data, {loading})

    let modify = (row, key, value, tip="操作成功")=> RESULT("/page/modify", {id: row.id, key, value}, d=> {
        M.ok(tip)
        if(key == 'main' && value === true){
            //修改其他页面的 main 属性
            beans.value.filter(b=>b.main).forEach(b=>b.main = false)
        }
        row[key] = value
    })

    let toAuth = (key="serviceAuth")=>{
        authText.value = curRow[key]
        authType = key

        nextTick(()=> authRef.value.open(`⌈${curRow.name}⌋ 的${key=='serviceAuth'?"访问权限":"管理权限"}`))
    }

    let onAuthChange = v=>{
        curRow[authType] = v
        modify(curRow, authType, v, `授权信息⌈${authType}⌋已更新`)
    }

    let toImport = ()=> H.io.chooseAndRead(".txt")
        .then(({filename, result})=>{
            console.debug(result)
            let newPage = JSON.parse(H.io.unCompress(result))
            let title   = "从文件中导入页面"

            if(!newPage.aid != aid)  newPage.aid = aid

            let tpl = findTemplate(newPage.template)
            let errors  = []
            //属性检查
            if(!newPage.name)   errors.push(`页面名称不能为空`)
            if(!newPage.aid)    errors.push(`未关联应用`)
            if(!tpl)            errors.push(`无效的类型 ${newPage.template}`)

            if(errors.length)   return M.dialog({type:"error", title, content: UI.html(`系统检测到页面数据存在以下问题：<br>${errors.map((e, i)=>`${i+1}、${e}`).join("<br>")}<br><br>请修正后再执行导入`)})

            delete newPage.id
            M.confirm(
                title,
                UI.html(`确定导入类型为 <b class="primary">${tpl.text}</b> 的页面 <b class="primary">⌈${newPage.name}⌋</b> 吗？`),
                ()=>{
                    RESULT("/page/create", newPage, d=>{
                        M.notice.ok(`成功从导入页面⌈${newPage.name}⌋`)
                        refresh()
                    })
                }
            )
        })
        .catch(msg=> M.notice.error(msg))

    const showMenu = (e,row, index)=>{
        if(menu.show)   return
        curRow = row
        Object.assign(menu, { x: e.x, y:e.y+12, show: true, index})
    }
    const onMenuSelect = key=>{
        switch(key){
            case "copyId":
                H.copyTo(`${curRow.aid}/${curRow.id}`)
                M.ok(`页面编号已复制到粘贴板`)
                break
            case "serviceAuth":
            case "editAuth":
                toAuth(key)
                break
            case "doc":
                docRef.value.open(curRow.id, curRow.name)
                break
            case "download":
                GET("/page/content", {id: curRow.id}, dd=>{
                    let item = JSON.parse(JSON.stringify(curRow))
                    delete item.id
                    item.content = dd. data

                    let name = `${item.name}-${item.aid}-${H.date.compact()}.txt`
                    H.io.saveToFile(H.io.compress(JSON.stringify(item)), name)
                    M.notice.ok(name, `页面导出成功`)
                })
                break
            case "move":
                let newId = ""
                M.dialog({
                    maskClosable: false, showIcon: false, style:{width:'480px'},
                    title: `迁移 ⌈${curRow.name}⌋ 到其他应用`,
                    content: ()=>h(AppSelector, {
                        value: curRow.aid,
                        "on-update:value": v=> newId = v
                    }),
                    positiveText:"确定迁移",
                    positiveButtonProps:{size:"large"},
                    onPositiveClick: ()=>{
                        if(!newId || newId == curRow.aid) return M.warn(`应用无变动`)
                        H.log.debug(`迁移到`, newId)
                        RESULT("/page/move-to", {id: curRow.id, aid: newId}, d=>{
                            M.ok(`迁移成功`)
                            beans.value.splice(menu.index, 1)
                        })
                    }
                })
                break
            case "delete":
                M.confirm(
                    "删除确认",
                    `删除页面⌈${curRow.name}⌋吗？`,
                    ()=>RESULT("/page/delete", {id: curRow.id},d=> {
                        M.ok(`页面删除成功`)
                        beans.value.splice(menu.index, 1)
                    })
                )
                break
        }
        nextTick(()=> menu.show = false)
    }

    onMounted( refresh )
</script>
