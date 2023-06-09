<!---->
<template>
    <n-tabs type="line">
        <n-tab-pane name="edit" display-directive="show:lazy" tab="服务总览">
            <TerminalList />
        </n-tab-pane>
        <n-tab-pane name="dashboard" display-directive="show:lazy" tab="服务访问记录">
            <LogList height="calc(100vh - 190px)" query />
        </n-tab-pane>
    </n-tabs>
</template>

<script setup>
    import { ref } from 'vue'

    import TerminalList from "./list.vue"
    import LogList from "@V/快应用/widget/terminal-log.vue"
</script>
