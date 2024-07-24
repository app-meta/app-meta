<!---->
<template>
    <n-tabs type="line">
        <n-tab-pane name="edit" display-directive="show:lazy" tab="服务总览">
            <TerminalList />
        </n-tab-pane>
        <n-tab-pane name="dashboard" display-directive="show:lazy" tab="服务访问记录">
            <LogList height="calc(100vh - 190px)" query />
        </n-tab-pane>

        <template #suffix>
            <n-button type="primary" secondary @click="toPort">
                <template #icon><n-icon :component="Cog" /></template>
                端口进程维护
            </n-button>
        </template>
    </n-tabs>
</template>

<script setup>
    import { ref, h } from 'vue'
    import { Cog } from '@vicons/fa'

    import TerminalList from "./list.vue"
    import LogList from "@V/快应用/widget/terminal-log.vue"

    import PortAndPid from './端口进程维护.vue'

    const toPort = ()=> M.dialog({title:`端口关联进程维护`, showIcon:false, maskClosable: false, content:()=> h(PortAndPid)})
</script>
