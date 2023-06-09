<template>
    <n-space>
        <n-input v-model:value="form.LIKE_id_name" placeholder="应用编号/名称" clearable />
        <n-input v-model:value="form.LIKE_author" placeholder="作者" style="width: 100px;" clearable />
        <n-button secondary circle type="success" @click="refresh">
            <template #icon><n-icon :component="Search" /> </template>
        </n-button>
    </n-space>

    <n-data-table class="mt-2" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans" :style="{height}"
        :remote="true" :bordered="false" striped size="small" flex-height />
</template>

<script setup>
    import { ref, onMounted, h } from 'vue'
    import { useRouter } from 'vue-router'
    import { Search, Plus, Trash, Edit, Table, Database, CodeBranch, Microsoft, Code } from "@vicons/fa"
    import { NPopconfirm } from 'naive-ui'

    import { runApp } from "@S/Runner"
    import P from "@Pagination"
    import Logo from "@VW/app.logo.vue"
    import Active from "@VW/app.active.vue"
    import Category from "@VW/app.category.vue"

    const router = useRouter()
    const props = defineProps({
        mine: {type:Boolean, default:true}
    })

    let { beans , form, pagination, refresh } = P(`/app/list${props.mine?"-mine":""}`)

    let height = "calc(100% - 40px)"
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
        { title:"作者", width:120, key:"author"},
        { title:"公开显示", width:90, render:(row)=> h(Active, {id:row.id, value:row.active})},
        { title:"热度/访问量", width:100, key:"launch" },
        { title:"简介", key:"summary",ellipsis:true },
        {
            width:130, align:"center",
            title: ()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
            render(row, rowIndex) {
                return [
                    UI.iconBtn(Edit, ()=> toEdit(row.id), {title:"编辑应用基本信息"}),
                    row.category == 1?
                        UI.iconBtn(Code, ()=> toVersion(row.id), {title:"网页机器人管理"})
                        :
                        UI.iconBtn(Microsoft, ()=> router.push({name:"app-page", params:{id: row.id}}), {title:"页面管理"}),
                    UI.iconBtn(Database, ()=> toData(row.id), {title:"管理应用数据库"}),
                    h(
                        NPopconfirm,
                        {
                            onPositiveClick:()=> toDelete(row.id, rowIndex),
                            "positive-button-props": {type:"error"}
                        },
                        {
                            default: ()=>`删除应用⌈${row.name}⌋吗？`,
                            trigger: ()=>UI.iconBtn(Trash, null, {title:"清空数据并删除该模版",type:"error"})
                        }
                    )
                ]
            }
        }
    ]

    let toEdit = (id="")=> router.push({name:"app-edit", query:{id}})
    let toDelete = (id, index)=> RESULT("/app/delete", {id}, d=> {
        M.notice.ok(`应用删除成功`)
        beans.value.splice(index, 1)
    })
    let toData = id=> router.push({name:"app-data", params:{id}})
    let toStart = row=> runApp(row)

    onMounted(() => {

    })
</script>
