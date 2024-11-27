<template>
    <n-space>
        <n-input v-model:value="form.LIKE_id_name" placeholder="应用编号/名称" clearable />
        <n-input v-model:value="form.LIKE_author" placeholder="作者" style="width: 100px;" clearable />
        <n-select :options :onUpdateValue="()=>nextTick(refresh)" v-model:value="form.EQ_offline" placeholder="状态" style="width: 120px;"></n-select>
        <n-button secondary circle type="primary" @click="refresh">
            <template #icon><n-icon :component="Search" /> </template>
        </n-button>
        <div class="h mt-2">默认只显示上架应用</div>
    </n-space>

    <n-data-table class="mt-2" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans" :style="{height}"
        :remote="true" :bordered="false" striped size="small" flex-height />
</template>

<script setup>
    import { ref, onMounted, h, nextTick } from 'vue'
    import { useRouter } from 'vue-router'
    import { Search, Plus, Trash, Edit, ShieldAlt, Table, Database, CodeBranch, Microsoft, Code, TachometerAlt, Cog, EllipsisH as Ellipsis, ListAlt } from "@vicons/fa"
    import { NPopconfirm, NDropdown, NButtonGroup, NTag } from 'naive-ui'

    import { runApp } from "@S/Runner"
    import P from "@Pagination"
    import Logo from "@VW/app.logo.vue"
    import Active from "@VW/app.active.vue"
    import Category from "@VW/app.category.vue"
    import Dashboard from "@VW/app.overview.vue"
    import Count from "@VW/count.vue"

    const router = useRouter()
    const props = defineProps({
        mine: {type:Boolean, default:true}
    })

    let { beans , form, pagination, refresh } = P({url:`/app/list${props.mine?"-mine":""}`, form:{ EQ_offline: 0 }})

    let height = "calc(100% - 40px)"
    const options = [{label:'不限',value:null},{label:'已上架',value:0},{label:'已下架',value:1}]
    let columns = [
        {
            title:"", width:40,
            render: (row, rowIndex)=>h(Logo, {text: row.abbr,  size:"medium"}),
        },
        {
            title:"应用名称", key:"name",width:240,ellipsis:true,
            render: row=>h('span',{onClick:()=>toStart(row), class:"cursor-pointer"}, row.name)
        },
        { title:"类型", key:"category", width: 100, render:row=> h(Category, {category: row.category})},
        { title:"状态", key:"offline", width:80, render:r=>h(NTag, {bordered:false, type:r.offline?"warning":"success"}, ()=>r.offline?"下架":"正常")},
        { title:"作者", width:120, key:"author"},
        { title:"公开显示", width:90, render:(row)=> h(Active, {id:row.id, value:row.active})},
        { title:"热度/访问量", width:100, key:"launch", render:row=> h(Count, {value: row.launch}) },
        { title:"简介", key:"summary",ellipsis:true },
        {
            width:110, align:"center",
            title: ()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
            render:(row, rowIndex)=> h(NButtonGroup, ()=>[
                UI.iconBtn(Edit, ()=> toEdit(row.id), {title:"编辑应用基本信息",secondary:true}),
                UI.iconBtn(Microsoft, ()=> router.push({name:"app-page", params:{id: row.id}}), {title:"页面管理",secondary:true}),
                h(
                    NDropdown,
                    {
                        trigger:"click",
                        options: [
                            { label:"权限/角色管理", key:"auth", icon:()=> UI.iconBtn(ShieldAlt)},
                            { label:"访问数据统计", key:"dashboard", icon:()=>UI.iconBtn(TachometerAlt)},
                            { label:"管理应用数据库",icon:()=>UI.iconBtn(Database), key:"data"},
                            { label:"查看日志", icon:()=>UI.iconBtn(ListAlt), key:"log"},
                            { label:"上架", key:"_", icon:()=>UI.iconBtn(Cog), children: [{label:"下架应用",key:"offline", disabled: row.offline}, {label:"上架应用",key:"online", disabled: !row.offline}]},
                            { type: "divider" },
                            { label:"删除", key:"delete", icon:()=> UI.iconBtn(Trash, null, {type:"error"}) }
                        ],
                        onSelect: key=> onSelect(row, key, rowIndex)
                    },
                    ()=> UI.iconBtn(Ellipsis, null, {title:"更多操作",secondary:true})
                )
                // h(
                //     NPopconfirm,
                //     {
                //         onPositiveClick:()=> toDelete(row.id, rowIndex),
                //         "positive-button-props": {type:"error"}
                //     },
                //     {
                //         default: ()=>`删除应用⌈${row.name}⌋吗？`,
                //         trigger: ()=>UI.iconBtn(Trash, null, {title:"清空数据并删除该模版",type:"error"})
                //     }
                // )
            ])
        }
    ]

    let toEdit = (id="")=> router.push({name:"app-edit", query:{id}})
    let toStart = row=> runApp(row)

    const onSelect = (row, key, index)=>{
        switch(key){
            case "auth":
                H.openUrl(router.resolve({name:`app-role`, params:{aid: row.id}}).href, {title: `${row.name} | 权限/角色`, center:true })
                break
            case "dashboard":
                M.dialog({
                    title:`${row.name}/应用访问统计`,
                    showIcon:false,
                    transformOrigin:"center",
                    style:{width: "1280px"},
                    content:()=> h(Dashboard, {aid: row.id})
                })
                break
            case "data":
                router.push({name:"app-data", params:{id: row.id}})
                break
            case "role":
                router.push({name:"app-role", params:{id: row.id}})
                break
            case "log":
                H.openUrl(router.resolve({name:`app-log`, params:{aid: row.id}}).href, {title: `${row.name} | 日志`, center:true })
                break
            case "offline":
            case "online":
                let msg = `目前应用处于${UI.wrapHtml(row.offline?"下架":"上架")}状态，确定切换到${UI.wrapHtml(row.offline?"上架":"下架（功能页面将无法使用）", "error")}吗？`
                M.confirm(`操作确认`, UI.html(msg), ()=> RESULT("/app/offline", {id:row.id}, d=>{
                    M.ok('操作成功')
                    refresh()
                }))
                break
            case "delete":
                M.confirm(
                    "删除确认",
                    UI.html(`删除应用${UI.wrapHtml(row.id+"/"+row.name)}吗？`),
                    ()=> RESULT("/app/delete", {id: row.id}, d=> {
                        M.notice.ok(`应用删除成功`)
                        beans.value.splice(index, 1)
                    })
                )
                break
        }
    }

    onMounted(() => {

    })
</script>
