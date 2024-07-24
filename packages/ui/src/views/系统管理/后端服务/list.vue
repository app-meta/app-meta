<template>
    <n-data-table :columns="columns" :loading="loading" :data="beans" :style="{height}"
        :remote="true" :bordered="false" striped size="small" flex-height />
</template>

<script setup>
    import { ref, onMounted, h } from 'vue'
    import { NTooltip, NTag, NSpace } from 'naive-ui'
    import { Bug, Clock,Hourglass,HourglassEnd, Stop, SyncAlt, Trash } from '@vicons/fa'

    import { terminalStatus } from "@S/FastApp"

    let loading = ref(false)
    let beans = ref([])

    let height = "calc(100vh - 280px)"
    let columns = [
        { title:"序号", align:"center", width:70, render:(row, index)=>index+1 },
        { title:"应用编号", key:"name" },
        {
            title:"容器版本", key:"vmVersion",
            render:row=> h(NSpace,{}, ()=>[
                h(NTag, {bordered:false, type:"info", size:"small"}, ()=>row.vm),
                row.vmVersion
            ])
        },
        { title:"状态", key:"status", render:row=> h(NTag, {bordered:false, type: row.status=='online'?"success":"warning"}, ()=>terminalStatus[row.status])},
        { title:"启动于", key:"uptime", width: 180, render: row=> H.date.datetime(row.uptime) },
        { title:"内存", key:"mem", width:140, render:row=> H.filesize(row.mem) },
        { title:"CPU(%)", key:"cpu", width:140 },
        { title:"统计于", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) },
        {
            title:"操作", width:100, align:"center",
            render:(row, index)=> [
                    UI.iconBtn(SyncAlt, ()=> doAction(row.name, 'restart', "重启"), {title:"重启后端服务", type:"warning"}),
                    UI.iconBtn(Stop, ()=> doAction(row.name, 'stop', "关闭"), {title:"关闭后端服务", type:"warning"}),
                    UI.iconBtn(Trash, ()=> doAction(row.name, 'remove', "永久移除"), {title:"永久删除后端服务", type:"error"})
            ]
        }
    ]

    const refresh = ()=> RESULT("/system/terminal/overview",{},d=> beans.value=d.data, {loading})

    const doAction = (id, action, cnName)=> M.confirm(`后端服务操作`, `确定要${cnName}应用「${id}」的后端服务吗？请慎重操作`, ()=>{
        RESULT("/system/terminal/"+action, {id}, d=>{
            M.notice.ok(`应用「${id}」的后端服务已${cnName}`)
            refresh()
        })
    })

    onMounted( refresh )
</script>
