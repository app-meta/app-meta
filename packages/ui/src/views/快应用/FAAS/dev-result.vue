<template>
    <n-space vertical>
        <n-card size="small">
            <template #header> <i class="fa fa-square-root-variable mr-2"></i>运算结果</template>
            {{ data.result }}
        </n-card>
        <n-card size="small">
            <template #header> <i class="fa fa-list mr-2"></i>运行日志</template>
            <n-log :lines="data.logs" :rows="12"></n-log>
        </n-card>
        <n-card size="small">
            <template #header> <i class="fa fa-cog mr-2"></i>运行环境</template>
            <div>
                <n-tag size="small" :bordered="false">原始参数</n-tag>
                {{ data.params }}
            </div>
            <div class="mt-2">
                <n-tag size="small" :bordered="false">用户对象</n-tag>
                {{ data.user }}
            </div>
        </n-card>

        <n-space justify="end">
            <n-button type="primary" secondary @click="toCopy">复制结果（JSON）</n-button>
        </n-space>
    </n-space>
</template>

<script setup>
    import { ref } from 'vue'

    const props = defineProps({data: Object})

    const toCopy = ()=> {
        H.copyTo(JSON.stringify(props.data, null, 4))
        M.ok(`结果已复制到粘贴板`)
    }
</script>
