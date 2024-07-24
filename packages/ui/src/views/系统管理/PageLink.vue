<!--页面关注信息维护-->
<template>
    <n-space>
        <n-input v-model:value="form.EQ_uid" placeholder="用户ID" clearable />
        <n-input v-model:value="form.EQ_pid" placeholder="页面ID" style="width: 100px;" clearable />
        <n-button secondary circle type="success" @click="refresh">
            <template #icon><n-icon :component="Search" /> </template>
        </n-button>
    </n-space>

    <n-data-table class="mt-2" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans" :style="{height}"
        :remote="true" :bordered="false" striped size="small" flex-height />

    <n-modal v-model:show="add.show" :style="{width:'640px'}" preset="dialog" title="新增用户与功能的关联">
        <n-alert type="info" :show-icon="false">
            格式为：{用户ID}{空格}{页面ID}，如 <Tag>00000 1</Tag>
        </n-alert>
        <n-input class="mt-3" v-model:value="add.text" />

        <template #action>
            <n-button type="primary" @click="addDo">确定</n-button>
        </template>
    </n-modal>
</template>

<script setup>
    import { ref, h, reactive } from 'vue'
    import { Search, Plus, Trash, Edit, SyncAlt } from "@vicons/fa"
    import { NPopconfirm, NSpace, NInput } from 'naive-ui'

    import P from "@Pagination"

    let { beans , form, pagination, refresh } = P(`/system/page/link/list`)
    const add = reactive({show:false, text:""})

    let height = "calc(100% - 40px)"
    let columns = [
        { title:"ID", align:"center", width:60, key:"id" },
        {
            title:"页面标题", key:"name", ellipsis:true,
            render: row=>h('span',{onClick:()=> H.app.runPage(row.aid, row.pid, true), class:"cursor-pointer"}, row.name)
        },
        { title:"页面ID", width:90, key:"pid" },
        { title:"应用ID", width:140, key:"aid" },
        { title:"用户ID", width:90, key:"uid" },
        { title:"生效", width:90, key:"active", render: row=>row.active?"是":"否"},
        { title:"更新日期", key:"addOn", width: 160, render: row=> H.date.datetime(row.addOn) },
        {
            width:90, align:"center",
            title: ()=> h(NSpace, {justify:"center"}, ()=>[
                UI.iconBtn(Plus, ()=> toAdd(), {type:"primary", secondary:true}),
                UI.iconBtn(SyncAlt, refresh, {type:"primary", quaternary:false, secondary:true, title:"刷新列表数据"})
            ]),
            render(row, rowIndex) {
                return [
                    // UI.iconBtn(Edit, ()=> toEdit(row)),
                    h(
                        NPopconfirm,
                        {
                            onPositiveClick:()=> toDelete(row.id, rowIndex),
                            "positive-button-props": {type:"error"}
                        },
                        {
                            default: ()=>`删除⌈${row.name}⌋吗？`,
                            trigger: ()=>UI.iconBtn(Trash, null, {type:"error"})
                        }
                    )
                ]
            }
        }
    ]

    const toAdd = ()=> {
        add.text = ""
        add.show = true
    }
    const addDo = ()=>{
        let ids = add.text.split(/\s+/)
        if(ids.length<2)    return M.warn(`数据填写格式有误`)
        let pid = ids[1]
        let index = pid.indexOf("/")
        if(index > 0)   pid = pid.substring(index+1)

        M.confirm(`关联录入`, `确定录入用户 ⌈${ids[0]}⌋ 与页面 ⌈${pid}⌋ 的关联吗？`, ()=> {
            RESULT("/system/page/link/add", {uid: ids[0], pid}, d=> {
                M.ok(`操作成功`)
                add.show = false

                refresh()
            })
        })
    }

    const toEdit = row=> M.warn(`功能开发中...`)
    const toDelete = (id, index)=> RESULT("/system/page/link/remove/"+id, {}, d=> {
        M.notice.ok(`数据删除成功`)
        beans.value.splice(index, 1)
    })
</script>
