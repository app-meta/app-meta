<!--行数据编辑-->
<template>
    <n-drawer v-model:show="active" :width="width" :close-on-esc="false">
        <n-drawer-content title="数据行编辑" :closable="true">
            <n-form :show-feedback="false" label-placement="left" :label-width="labelWidth">
                <n-space vertical>
                    <n-form-item v-for="item in items" :label="item.id">
                        <template #label>
                            <Tag v-if="item.pri"><n-icon :component="Key" color="primary" title="此字段为主键，不支持修改" /></Tag>
                            {{item.id}}
                        </template>
                        <n-input-number v-if="item.form=='number'" v-model:value="item.value" :disabled="item.pri" />
                        <n-switch v-else-if="item.form=='switch'" v-model:value="item.value" :disabled="item.pri" />
                        <n-input v-else :type="item.form" :rows="4" v-model:value="item.value" :disabled="item.pri" />
                    </n-form-item>
                </n-space>
            </n-form>

            <template #footer>
                <n-space>
                    <n-button type="primary" secondary @click="doUpdate">保存修改</n-button>

                    <n-popconfirm :negative-text="null" @positive-click="toDel" placement="top-end">
                        <template #trigger>
                            <n-button type="error" secondary>删除数据</n-button>
                        </template>
                        确定删除本条数据吗？
                    </n-popconfirm>
                </n-space>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<script setup>
    import { ref, onMounted, reactive } from 'vue'
    import { Key, Trash } from "@vicons/fa"

    const props = defineProps({
        width: {type:[String, Number], default: 1080},
        sourceId:{type:[Number, String]}
    })

    let labelWidth = ref(100)
    let active = ref(false)
    let items = ref({})
    let values = {}
    let db = ""
    let table = ""

    /**
     * 构建 where 语句
     */
    const buildMatch = ()=> {
        // let m = {}
        // items.value.filter(i=>i.pri).map(v=>m[v.id]=v.value)
        // return m
        return items.value.filter(i=>i.pri).map(v=>`${v.id}=${JSON.stringify(v.value)}`).join(" AND ")
    }

    const open = (cols, _db, _table) =>{
        db = _db
        table = _table

        values = {}
        cols.forEach(c=> values[c.id]=c.value)
        labelWidth.value = 40 + 6.5 * Math.max(...cols.map(c=>c.id.length))

        items.value = cols
        active.value = true
    }

    const doUpdate = ()=>{
        let changes = {}
        items.value.forEach(c=> {
            if(values[c.id] != c.value)
                changes[c.id] = c.value
        })

        //检测变动数量
        if(Object.keys(changes).length == 0)  return M.warn(`系统检测到数据未修改`)

        _do(changes)
    }
    const toDel = ()=> _do()

    const _do = obj=>{
        let action = obj?"U":"D"
        RESULT("/dbm", {sourceId: props.sourceId, db, table, action, condition: buildMatch(), obj}, d=>{
            M.notice.ok(`响应数据：${d.data}`, `数据${action=='U'?"修改":"删除"}成功`)

            if(action == "D"){
                items.value = []
                active.value = false
            }
        })
    }

    defineExpose({ open })
</script>
