<template>
    <n-element style="position:fixed;z-index: 999;bottom: 30px;right:2px;width: 44px;height:44px;">
        <n-popover trigger="click" style="width: 260px" @update:show="onShow" placement="top-end">
            <template #trigger>
                <n-button circle secondary type="primary"><template #icon><n-icon :component="Bars" /></template></n-button>
            </template>
            <template #header><n-text class="text-lg">编辑小助手</n-text></template>

            <n-space vertical>
                <n-button secondary block disabled title="实验性功能，待完善">从本地恢复旧版本</n-button>
            </n-space>
        </n-popover>
    </n-element>
</template>

<script setup>
    import { ref, reactive } from 'vue'
    import { Bars } from '@vicons/fa'

    const props = defineProps({page:Object})

    let link    = reactive({checked: false, value: false })

    const toDate = d=>H.date.datetime(d)
    const onShow = show=>{
    }
</script>
