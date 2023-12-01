export const template = `<template>
    {{text}}，counter = {{count}}

    <div>
        <n-button type="primary" @click="()=>count++">点我+1</n-button>
    </div>
</template>
<script setup>
    import { ref } from 'vue'

    // 支持的组件，注意引入路径不能修改（完整组件清单，请打开右上角帮助）
    // 分页封装
    // import P from "@Pagination"
    // 图表组件
    // import Chart from "@C/chart.vue"

    let text = ref("这是一个 SFC 模版")
    let count = ref(0)
</script>
`
