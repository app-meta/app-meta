export const template = `<template>
    {{text}}，counter = {{count}}

    <div>
        <n-button type="primary" @click="()=>count++">点我+1</n-button>
    </div>
</template>
<script setup>
    import { ref } from 'vue'

    // 支持的组件，注意引入路径不能修改
    // 图表组件
    // import Chart from "@C/chart.vue"
    // Markdown 渲染器
    // import MDRender from "@C/markdown/md.viewer.vue"
    // 数据文件引入工具
    // import FileImportor from "@CC/file.import.vue"
    // 点击可编辑文本
    // import ClickInput from "@C/dbclick.input.vue"
    // 文件上传工具
    // import Uploader from "@C/uploader.vue"
    // 标题组件
    // import Title from "@V/widget/page.title.vue"
    // 分页封装
    // import P from "@Pagination"

    let text = ref("这是一个 SFC 模版")
    let count = ref(0)
</script>
`
