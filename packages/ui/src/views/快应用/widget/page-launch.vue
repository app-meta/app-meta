<!-- 页面访问记录 -->
<template>
    <n-data-table size="small" ref="table" :columns :data flex-height :style="{ height }" :loading :bordered="false" striped>
    </n-data-table>
    <div class="text-center mt-2">
        <n-button secondary type="primary" @click="toExport">导出CSV</n-button>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const props = defineProps({
        pid: {type:[Number, String]},
        height: {type:String}
    })

    let table = ref()
    let loading = ref(true)
    let data = ref([])

    const columns = [
        { title:"序号", width:55, align:"center", render:(row, i)=> i+1},
        { title:"用户ID", key:"uid" },
        { title:"部门", width:240, key:"depart" },
        { title:"渠道", width:100, key:"channel" },
        { title:"IP", width: 140, key:"ip" },
        { title:"访问日期",key:"addOn", render:r=>H.date.datetime(r.addOn), width:180 }
    ]

    const toExport = ()=> {
        let rows = [columns.map(v=>v.title)]
        data.value.forEach((b,i)=> rows.push([i+1, b.uid, b.depart, b.channel, b.ip, H.date.datetime(b.addOn)]))
        H.io.saveToCSV(rows, `页面近期访问记录-${H.date.date()}`)
    }

    onMounted(() => {
        RESULT("/app/overview", { pid: props.pid }, d=>{
            data.value = d.data
        }, { loading })
    })
</script>
