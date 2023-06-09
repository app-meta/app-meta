<!--页面关注信息维护-->
<template>
    <n-space justify="space-between">
        <n-space>
            <n-input v-model:value="form.LIKE_uid_name" placeholder="ID或者用户名" clearable />
            <n-button secondary circle type="success" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>
        <n-space>
            <n-button type="primary" @click="toDepart">部门管理</n-button>
            <n-tooltip placement="bottom">
                <template #trigger>
                    <n-button :loading="loading" type="primary" @click="refreshRemote">立即远程同步</n-button>
                </template>
                手动执行用户远程同步作业（需先设置用户同步地址）
            </n-tooltip>
        </n-space>
    </n-space>

    <n-data-table class="mt-2" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans" :style="{height}"
        :remote="true" :bordered="false" striped size="small" flex-height />

    <n-modal v-model:show="edit.show" :style="{width:'640px'}" preset="card" title="编辑用户信息">
        <n-form :show-feedback="true" label-placement="left" label-width="60">
            <n-form-item label="编号"> <n-input v-model:value="bean.id" :disabled="!edit.isNew" /> </n-form-item>
            <n-form-item label="姓名"> <n-input v-model:value="bean.name" /> </n-form-item>
            <n-form-item label="部门"> <DepartSelector v-model:value="bean.did" /> </n-form-item>
        </n-form>

        <div class="text-right mt-3">
            <n-button type="primary" @click="addDo">确定</n-button>
        </div>
    </n-modal>

    <Department ref="department" />
</template>

<script setup>
    import { ref, h, reactive } from 'vue'
    import { Search, Plus, Trash, Edit, SyncAlt } from "@vicons/fa"
    import { NPopconfirm, NSpace } from 'naive-ui'

    import P from "@Pagination"

    import DepartSelector from "@CC/selector.depart.vue"
    import Department from "./Department.vue"

    let { beans , form, pagination, refresh } = P(`/system/account/list`)
    let bean = ref({})
    let edit = reactive({show:false, isNew: false})

    let height = "calc(100% - 40px)"
    let columns = [
        { title:"序号", align:"center", width:60, render:(row, index)=>index+1 },
        { title:"用户ID", key:"id" },
        { title:"用户名称", key:"name" },
        { title:"部门ID", key:"did" },
        {
            width:90, align:"center",
            title: ()=> h(NSpace, {justify:"center"}, ()=>[
                UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
                UI.iconBtn(SyncAlt, refresh, {type:"primary", quaternary:false, secondary:true, title:"刷新列表数据"})
            ]),
            render(row, rowIndex) {
                return [
                    UI.iconBtn(Edit, ()=> toEdit(row)),
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
    let loading = ref(false)
    let department = ref()

    const toEdit = (row={})=> {
        bean.value = row
        edit.isNew = !row.id
        edit.show = true
    }
    const toDelete = (id, index)=> RESULT("/system/account/delete", {id}, d=> {
        M.notice.ok(`数据删除成功`)
        beans.value.splice(index, 1)
    })
    // const toDepart = ()=> M.dialog({
    //     title:"部门管理",
    //     type:"info",
    //     content: ()=> h(Department, {}),
    //     style:{width: '800px'}
    // })
    const toDepart = ()=> department.value.open()

    const refreshRemote = ()=> RESULT("/system/account/refresh", {}, d=> M.notice.ok(d.data), {loading})
</script>
