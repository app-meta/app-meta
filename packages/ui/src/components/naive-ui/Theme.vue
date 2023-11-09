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

        <n-space justify="space-between">
            <n-text>主配色</n-text>
            <n-popover placement="bottom" trigger="click" :width="320">
                <template #trigger>
                    <n-button :color="colorValue" size="tiny">{{color}}</n-button>
                </template>
                <n-grid :x-gap="6" :y-gap="6" :cols="4">
                    <n-gi v-for="(c, name) in colors">
                        <n-button @click="changeColor(name)" block :color="c[0]" size="small">
                            <n-icon v-if="name==color" color="white" :component="Check"/>
                            <template v-else>{{name}}</template>
                        </n-button>
                    </n-gi>
                </n-grid>
            </n-popover>
        </n-space>
    </n-space>
</template>

<script setup>
    import { ref, watch, computed } from 'vue'
    import { Check } from '@vicons/fa'

    import { useUISetting } from "@/store/uiSetting"

    import { getPrimaryColor, colors } from "@/theme/colors"

    const uiSetting = useUISetting()

    let theme = ref(uiSetting.theme)
    let darkNav = ref(uiSetting.darkNav)
    let color = ref(uiSetting.color)

    let colorValue = computed(()=> getPrimaryColor(color.value).primaryColor )

    watch(theme, e=> {
        uiSetting.updateTheme(e)
        M.info(`主题切换`)
    })
    watch(darkNav, v=> uiSetting.updateDarkNav(v))

    const changeColor = name=>{
        uiSetting.updateColor(name)
        M.info(`主配色切换为⌈${name}⌋，刷新可见效果`)
        console.debug(color.value, uiSetting.color)
        color.value = uiSetting.color
    }
</script>
