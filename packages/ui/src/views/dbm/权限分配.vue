<template>
    <n-drawer v-model:show="active" width="920" :close-on-esc="false">
        <n-drawer-content title="数据源权限分配" :closable="true">
            <n-table :bordered="false" size="small">
                <thead>
                    <tr>
                        <th>用户</th>
                        <th>数据源</th>
                        <th>权限</th>
                        <th>备注</th>
                        <th class="text-center" width="30"> <n-button circle @click="toEdit()"> <n-icon :component="Plus" /> </n-button> </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in beans" @dblclick="toEdit(item)">
                        <td>{{item.uid}}</td>
                        <td>{{item.name}}</td>
                        <td>{{item.allow}}</td>
                        <td><n-ellipsis :line-clamp="1">{{item.summary}}</n-ellipsis></td>
                        <td class="text-center">
                            <n-popconfirm :negative-text="null" @positive-click="()=>toDel(item.id, index)" placement="top-end">
                                <template #trigger>
                                    <n-button type="error" size="tiny" circle quaternary><template #icon><n-icon :component="Trash" /></template></n-button>
                                </template>
                                删除{{item.uid}}对于数据源⌈{{item.name}}⌋的权限吗？
                            </n-popconfirm>
                        </td>
                    </tr>
                </tbody>
            </n-table>
            <n-text depth="3">共 {{beans.length}} 则数据</n-text>
        </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="edit.show" :style="{width:'640px'}" preset="card" title="编辑数据源">
        <n-form :show-feedback="false" label-placement="left" label-width="60">
            <n-space vertical>
                <n-form-item label="用户"> <n-input v-model:value="bean.uid" placeholder="单个用户ID（用户与数据源为唯一主键）" /> </n-form-item>
                <n-form-item label="数据源">
                    <n-select :options="sources" v-model:value="bean.sourceId" @update:value="onSelect"></n-select>
                </n-form-item>
                <n-form-item label="权限">
                    <div>
                        <n-input v-model:value="bean.allow" placeholder="具备的操作权限，无限制请填写*" />
                        <n-text class="mt-2 text-sn" depth="3">
                            可选权限：SQL（执行SQL）、C（新建）、U（更新）、R（查询）、D（删除），多个权限用英文逗号隔开
                        </n-text>
                    </div>
                </n-form-item>
                <n-form-item label="备注"> <n-input type="textarea" :rows="3" v-model:value="bean.summary"  placeholder="备注信息"/> </n-form-item>
            </n-space>
        </n-form>

        <div class="text-right mt-3">
            <n-button type="primary" @click="addDo">确定并保存</n-button>
        </div>
    </n-modal>
</template>

<script setup>
    import { ref, onMounted, reactive } from 'vue'
    import { Plus, Trash } from "@vicons/fa"

    import ClickInput from "@C/dbclick.input.vue"

    let active = ref(false)
    let beans = ref([])
    let edit = reactive({show:false, isNew: false})
    let bean = ref({})
    let sources = ref([])

    const refresh = ()=> RESULT("/dbm/auth/list", {}, d=> beans.value = d.data)

    const open = ()=>{
        if(!beans.value.length)  refresh()

        active.value = true
    }

    const toEdit = (row={uid:"", sourceId:undefined, allow:"*"})=> {
        RESULT("/dbm/source/list",{}, d=> sources.value=d.data.map(v=>({value:v.id, label:v.name})))

        bean.value = row
        edit.isNew = !row.id
        edit.show = true
    }
    const addDo = ()=>{
        let { sourceId,uid, allow, name } = bean.value
        if(!sourceId || !uid || !allow)    return M.warn(`用户、数据源、权限值均不能为空`)

        RESULT("/dbm/auth/edit", bean.value, d=> {
            M.notice.ok(`${uid}的数据源⌈${name}⌋权限编辑成功`)
            edit.show = false

            refresh()
        })
    }

    const onSelect = (v, opt)=> bean.value.name = opt.label
    const toDel =(id, index)=> RESULT("/dbm/auth/delete",{id},()=>{
        beans.value.splice(index, 1)
        M.ok(`操作成功`)
    })

    defineExpose({ open })
</script>
