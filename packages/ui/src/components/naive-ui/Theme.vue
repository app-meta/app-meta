<template>
    <n-space vertical class="py-1 px-2">
        <div class="text-center pb-1"><n-text>主题配色</n-text></div>
        <n-radio-group size="small" v-model:value="theme">
            <n-radio-button value="light">明亮</n-radio-button>
            <n-radio-button value="dark">暗黑</n-radio-button>
            <n-radio-button value="auto">自动</n-radio-button>
        </n-radio-group>


        <n-space justify="space-between">
            <n-text>深色导航栏</n-text>
            <n-switch v-model:value="darkNav" />
        </n-space>
    </n-space>
</template>

<script setup>
    import { ref, watch } from 'vue'
    import { useUISetting } from "@/store/uiSetting"

    const uiSetting = useUISetting()

    let theme = ref(uiSetting.theme)
    let darkNav = ref(uiSetting.darkNav)

    watch(theme, e=> {
        uiSetting.updateTheme(e)
        M.info(`主题切换`)
    })
    watch(darkNav, v=> uiSetting.updateDarkNav(v))
</script>
