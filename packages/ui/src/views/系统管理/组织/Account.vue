<!--人员信息维护-->
<template>
    <n-space justify="space-between">
        <n-space>
            <n-input v-model:value="form.LIKE_id_name" placeholder="ID或者用户名" clearable />
            <n-button secondary circle type="success" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>
        <n-space>
            <n-button type="primary" @click="toDepart">部门管理</n-button>

            <n-dropdown trigger="click" :options="refreshOptions" @select="handleSelect" show-arrow>
                <n-button :loading="loading" type="primary">用户数据同步</n-button>
            </n-dropdown>
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
    import { Search, Plus, Trash, Edit, SyncAlt, ShieldAlt } from "@vicons/fa"
    import { NPopconfirm, NSpace, NText, NPopover } from 'naive-ui'

    import P from "@Pagination"

    import DepartSelector from "@CC/selector.depart.vue"
    import Department from "./Department.vue"
    import RoleWidget from "./role.widget.vue"
    import RoleUpdate from "./role.update.vue"

    const url = suffix=>`/system/account/${suffix}`

    let { beans , form, pagination, refresh } = P(url('list'))
    let bean = ref({})
    let edit = reactive({show:false, isNew: false})

    let height = "calc(100% - 40px)"
    let columns = [
        { title:"序号", align:"center", width:60, render:(row, index)=>index+1 },
        { title:"用户ID", key:"id" },
        { title:"用户名称", key:"name" },
        { title:"部门ID", key:"did" },
        {
            width:110, align:"center",
            title: ()=> h(NSpace, {justify:"center"}, ()=>[
                UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
                UI.iconBtn(SyncAlt, refresh, {type:"primary", quaternary:false, secondary:true, title:"刷新列表数据"})
            ]),
            render(row, rowIndex) {
                return [
                    UI.iconBtn(Edit, ()=> toEdit(row)),
                    h(
                        NPopover,
                        { placement:"top-end" },
                        {
                            default: ()=> h(RoleWidget, {bean: row}),
                            trigger: ()=> UI.iconBtn(ShieldAlt, ()=>toRole(row))
                        }
                    ),
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
    let refreshOptions = [
        { key:"header", type:"render", render:()=>h('div',{class:"m-2"}, h(NText, {depth:3}, ()=>'手动执行用户远程同步作业')) },
        { key:"auto", label:"远程/文件同步" },
        { key:"text", label:"手工输入" }
    ]

    const toEdit = (row={})=> {
        bean.value = row
        edit.isNew = !row.id
        edit.show = true
    }
    const toDelete = (id, index)=> RESULT(url("delete"), {id}, d=> {
        M.notice.ok(`数据删除成功`)
        beans.value.splice(index, 1)
    })
    const toDepart = ()=> department.value.open()

    const handleSelect = n=>{
        if(n=='text')
            return M.prompt(
                `输入用户数据`,
                {
                    type:"textarea",
                    rows:15,
                    style:{width:"900px"},
                    placeholder:"请输入标准的 JSON 格式（以 { 或者 [ 开头），每个元素格式为：[用户ID,用户名,部门ID 部门名称]"
                }
            ).then(refreshRemote)

        refreshRemote()
    }

    const refreshRemote = (text="")=> RESULT(url("refresh"), {text}, d=> M.notice.ok(d.data), {loading})

    const toRole = bean=> M.dialog({
        style:{width:"820px"},
        title:`配置⌈${bean.id}/${bean.name}⌋的角色`,
        content: ()=> h(RoleUpdate, {bean})
    })
</script>
