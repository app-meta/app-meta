<!--二维数据表格-->
<template>
    <!-- <div v-if="loading" class="text-center"><n-spin></n-spin></div>
    <MDRender v-else :code="items" /> -->
    <n-spin :show="loading">
        <MDRender v-if="!!content" :code="content" />
    </n-spin>
</template>

<script setup>
    import { ref, watch } from 'vue'

    import MDRender from "@C/markdown/md.viewer.vue"
    import { widgetProps, loadData } from "."

    const props = defineProps(widgetProps())

    let { loading, content } = loadData(props)
</script>
