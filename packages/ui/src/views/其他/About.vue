<template>
    <n-card>
        <template #header><InfoCircle class="icon" /> 关于</template>

        基于
        <a href="https://spring.io/projects/spring-boot" target="_blank"><n-tag type="primary" :bordered="false" class="cursor-pointer">SpringBoot 3</n-tag></a>、
        <a href="https://www.mysql.com/" target="_blank"><n-tag type="primary" :bordered="false" class="cursor-pointer">MySQL</n-tag></a>、
        <a href="https://cn.vuejs.org/" target="_blank"><n-tag type="primary" :bordered="false" class="cursor-pointer">VUE3</n-tag></a>、
        <a href="https://www.naiveui.com" target="_blank"><n-tag type="primary" :bordered="false" class="cursor-pointer">Naive UI</n-tag></a>
        的低代码应用开发平台，
        功能包含但不限于表单可视化设计、H5 小程序、统计图表、问卷调查、后端服务部署、多源数据库管理、动态接口等
        。

        <n-descriptions class="mt-4"  label-placement="left" bordered :column="4" title="生产环境依赖" size="small">
            <n-descriptions-item v-for="(version, name) in dependencies" :label="name">{{version}}</n-descriptions-item>
        </n-descriptions>

        <n-descriptions class="mt-4" label-placement="left" bordered :column="3" title="开发环境依赖" size="small">
            <n-descriptions-item v-for="(version, name) in devDependencies" :label="name">{{version}}</n-descriptions-item>
        </n-descriptions>
    </n-card>
</template>

<script setup>
    import { ref } from 'vue'
    import { InfoCircle, Code } from "@vicons/fa"

    const { dependencies, devDependencies } = _APP_INFO_
</script>
