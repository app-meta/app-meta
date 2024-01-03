<template>
    <n-element style="position:fixed;z-index: 999;bottom: 30px;right:2px;width: 44px;height:44px;">
        <n-popover trigger="click" style="width: 260px" @update:show="onShow" placement="top-end">
            <template #trigger>
                <n-button circle secondary type="primary"><template #icon><n-icon :component="Bars" /></template></n-button>
            </template>
            <template #header><n-text class="text-lg">编辑小助手</n-text></template>

            <n-space vertical>
                <n-space justify="space-between">
                    <n-text>应用/功能ID</n-text>
                    <n-text depth="3">{{aid}}/{{id}}</n-text>
                </n-space>
                <n-button secondary block disabled title="实验性功能，待完善">从本地恢复旧版本</n-button>
            </n-space>
        </n-popover>
    </n-element>
</template>

<script setup>
    import { ref, reactive } from 'vue'
    import { useRoute } from 'vue-router'
    import { Bars } from '@vicons/fa'

    let {id, aid}   = useRoute().params

    const onShow = show=>{
    }
</script>
