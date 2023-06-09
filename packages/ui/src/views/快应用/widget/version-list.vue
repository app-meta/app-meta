<template>
    <n-data-table :columns="columns" :data="beans" striped :style="{height}" size="small" flex-height :bordered="true" />
</template>

<script setup>
    import { ref, reactive, h, onMounted } from 'vue'

    const props = defineProps({
        height:{type:String, default:"300px"},
        aid: {type:String},
        pid: {type:[Number, String]}
    })

    const columns   = [
        { title:"版本号", key:"version", width: 100 },
        { title:"发布者", width:160, key:"uid"},
        { title:"文件大小", width:90, render:(row)=> h('span', H.filesize(row.size))},
        { title:"说明", key:"summary",ellipsis:true },
        { title:"部署日期", key:"addOn", width: 170, render: row=> H.date.datetime(row.addOn) },
    ]
    let beans = ref([])

    let refresh = ()=> RESULT("/page/h5/list", { aid:props.aid, pid: props.pid }, d=> beans.value = d.data)

    onMounted( refresh )
    defineExpose({ refresh })
</script>
