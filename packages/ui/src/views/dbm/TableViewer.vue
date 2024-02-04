<template>
    <n-space>
        <n-input v-model:value="model.condition" style="width:560px" @keyup="handleKeyUp" placeholder="统计查询，若需要增加 ORDER、GROUP 等可通过前置 1=1">
            <template #prefix><Tag>WHERE</Tag></template>
        </n-input>
        <n-input v-model:value="model.columns" style="width:320px" @keyup="handleKeyUp">
            <template #prefix><Tag>列</Tag></template>
        </n-input>
        <n-button secondary type="primary" @click="refresh"><template #icon><n-icon :component="Search" /></template></n-button>
        <n-popover trigger="click" width="380">
            <template #trigger>
                <n-button secondary type="primary"><template #icon><n-icon :component="Download" /></template></n-button>
            </template>
            <n-space vertical>
                <n-input v-model:value="exportFilter" placeholder="列筛选，以英文逗号隔开" />
                <n-button type="primary" @click="toExport">导出CSV</n-button>
            </n-space>
        </n-popover>
        <n-text depth="3">{{model.info}}</n-text>
    </n-space>
    <TableView class="mt-2" ref="tableView" style="height: calc(100vh - 205px)" @edit="row=> emits('edit', row, db, table)"/>
</template>

<script setup>
    import { ref, onMounted, reactive, nextTick } from 'vue'
    import { Search, Download } from '@vicons/fa'

    import TableView from "./table.vue"

    const emits = defineEmits(['edit'])
    const props = defineProps({
        sourceId:{type:[Number, String]},
        db:{type:String},
        table:{type:String}
    })
    const model = reactive({condition:"", columns:"", info:""})
    let exportFilter = ref("")
    let originHead = []
    let originData = []

    let tableView = ref()

    const refresh = ()=> {
        let started = Date.now()
        RESULT(
            "/dbm",
            Object.assign({action:"R"}, props, model),
            d=>{
                model.info = `读取到 ${d.data.length-1} 条数据，耗时 ${~~(Date.now()-started)} ms`
                originHead = d.data[0]
                tableView.value.update(d.data)
                nextTick(()=> originData = d.data)
            }
        )
    }

    const handleKeyUp = ({key})=> key=='Enter' && refresh()
    const toExport = ()=>{
        if(originData.length == 0)  return "当前无数据"

        let input = exportFilter.value.trim()
        /*@type {Array} */
        let heads = input? input.split(",").map(v=>v.trim()) : originHead
        let headIdxs = heads.map(v=> originHead.indexOf(v))

        let rows = [heads]
        originData.forEach(d=>{
            rows.push(headIdxs.map(k=> d[k]))
        })
        H.io.saveToCSV(rows, `数据导出-${H.date.compact()}`)
    }

    onMounted( refresh )
</script>
