<template>
    <n-drawer v-model:show="active" width="640" :close-on-esc="false">
        <n-drawer-content title="部门管理" :closable="true">
            <n-table :bordered="false">
                <thead>
                    <tr>
                        <th width="160">编号</th>
                        <th>名称</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in beans">
                        <td>{{item.id}}</td>
                        <td><ClickInput size="small" :text="item.name" @update="v=> onUpdate(item, v)"/></td>
                    </tr>
                </tbody>
            </n-table>
            <n-text depth="3">共 {{beans.length}} 则数据</n-text>
        </n-drawer-content>
    </n-drawer>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    import ClickInput from "@C/dbclick.input.vue"

    let active = ref(false)
    let beans = ref([])

    const open = ()=>{
        if(!beans.value.length)
            RESULT("/account/departs", {}, d=> beans.value = d.data)

        active.value = true
    }

    const onUpdate = (row, name)=>{
        console.debug(row, name)
    }

    defineExpose({ open })
</script>
