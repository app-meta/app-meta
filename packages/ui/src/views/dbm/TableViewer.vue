<template>
    <n-space>
        <n-input v-model:value="model.condition" style="width:460px">
            <template #prefix><Tag>WHERE</Tag></template>
        </n-input>
        <n-input v-model:value="model.columns" style="width:320px">
            <template #prefix><Tag>列</Tag></template>
        </n-input>
        <n-button secondary type="primary" @click="refresh"><template #icon><n-icon :component="Search" /></template></n-button>
        <n-text depth="3">{{model.info}}</n-text>
    </n-space>
    <TableView class="mt-2" ref="tableView" style="height: calc(100vh - 205px)" @edit="row=> emits('edit', row, db, table)"/>
</template>

<script setup>
    import { ref, onMounted, reactive } from 'vue'
    import { Search } from '@vicons/fa'

    import TableView from "./table.vue"

    const emits = defineEmits(['edit'])
    const props = defineProps({
        sourceId:{type:[Number, String]},
        db:{type:String},
        table:{type:String}
    })
    const model = reactive({condition:"", columns:"", info:""})

    let tableView = ref()

    const refresh = ()=> {
        let started = Date.now()
        RESULT(
            "/dbm",
            Object.assign({action:"R"}, props, model),
            d=>{
                model.info = `读取到 ${d.data.length-1} 条数据，耗时 ${~~(Date.now()-started)} ms`
                tableView.value.update(d.data)
            }
        )
    }

    onMounted( refresh )
</script>
