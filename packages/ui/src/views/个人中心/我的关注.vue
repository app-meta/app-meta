<template>
    <n-space>
        <n-input v-model:value="form.LIKE_name" placeholder="标题" style="width: 140px;" clearable />
        <n-button secondary circle type="success" @click="refresh">
            <template #icon><n-icon :component="Search" /> </template>
        </n-button>
    </n-space>

    <!-- :pagination="pagination"  -->
    <n-data-table class="mt-2" :columns="columns" :loading="pagination.loading" :data="beans" :style="{height}"
        :remote="true" :bordered="false" striped size="small" flex-height />
</template>

<script setup>
    import { h,ref } from 'vue'
    import { Search, Trash } from "@vicons/fa"
    import { NPopconfirm, NInput, NTag } from 'naive-ui'

    import Title from "@V/widget/page.title.vue"
    import Template from "@V/widget/page.template.vue"

    import { templates, findTemplate } from "../快应用"
    import P from "@Pagination"

    let { beans , form, pagination, refresh } = P(`/page/link/list`)

    let height = "calc(100% - 40px)"
    let columns = [
        { title:"#", align:"center", width:60, render:(row,i)=>i+1 },
        {
            title:"页面标题", key:"name", ellipsis:true,
            render: row=>h('span',{onClick:()=> H.app.runPage(row.aid, row.pid, true), class:"cursor-pointer"}, h(Title, {text:row.name}))
        },
        {
            title:"类型", key:"template", width: 90, render:row=> h(Template, {bean: findTemplate(row.template)})
        },
        // { title:"页面ID", width:90, key:"pid" },
        { title:"应用ID", width:140, key:"aid", render:row=> h(NTag,{bordered:false, onClick:()=>H.app.run(row.aid),class:"cursor-pointer"}, ()=>row.aid) },
        { title:"生效", width:70, key:"active", render: row=>row.active?"是":"否"},
        { title:"更新日期", key:"addOn", width: 160, render: row=> H.date.datetime(row.addOn) },
        {
            width:50, align:"center",
            title: "操作",
            render(row, rowIndex) {
                return [
                    h(
                        NPopconfirm,
                        {
                            onPositiveClick:()=> toDelete(row.pid, rowIndex),
                            "positive-button-props": {type:"error"}
                        },
                        {
                            default: ()=>`确定取消对⌈${row.name}⌋的关注吗？`,
                            trigger: ()=>UI.iconBtn(Trash, null, {type:"error"})
                        }
                    )
                ]
            }
        }
    ]

    const toDelete = (id, index)=> RESULT("/page/link/remove/"+id, {}, d=> {
        M.notice.ok(`数据删除成功`)
        beans.value.splice(index, 1)
    })
</script>
