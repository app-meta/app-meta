<template>
    <n-space vertical class="py-1 px-2">
        <div class="text-center pb-1"><n-text>主题配色</n-text></div>
        <n-radio-group size="small" @update:value="v=>uiSetting.setTheme(v)" :value="uiSetting.theme">
            <n-radio-button value="light">明亮</n-radio-button>
            <n-radio-button value="dark">暗黑</n-radio-button>
            <n-radio-button value="auto">自动</n-radio-button>
        </n-radio-group>
        <n-space justify="space-between">
            <n-text>主配色</n-text>
            <n-popover placement="bottom" trigger="click" :width="320">
                <template #trigger>
                    <n-button :color="colorValue" size="tiny">{{uiSetting.color}}</n-button>
                </template>
                <n-text depth="3">请选择配色（需刷新页面才能生效）</n-text>
                <n-grid :x-gap="6" :y-gap="6" :cols="4">
                    <n-gi v-for="(c, name) in colors">
                        <n-button @click="changeColor(name)" block :color="c" size="small">
                            <n-icon v-if="name==uiSetting.color" color="white" :component="Check"/>
                            <template v-else>{{name}}</template>
                        </n-button>
                    </n-gi>
                </n-grid>
            </n-popover>
        </n-space>
        <n-space justify="space-between">
            <n-text>深色导航栏</n-text>
            <n-switch v-model:value="uiSetting.darkNav" />
        </n-space>
        <n-space justify="space-between">
            <n-text>以新窗口方式打开应用</n-text>
            <n-switch v-model:value="uiSetting.openBlank" />
        </n-space>
    </n-space>
</template>

<script setup>
    import { ref, watch, computed } from 'vue'
    import { Check } from '@vicons/fa'

    import { useUISetting, colors, defaultPrimaryColor } from "@/store/uiSetting"

    const uiSetting = useUISetting()

    let colorValue = computed(()=> colors[uiSetting.color] || defaultPrimaryColor )

    // watch(theme, e=> {
    //     uiSetting.updateTheme(e)
    //     M.info(`主题切换`)
    // })
    // watch(darkNav, v=> uiSetting.updateDarkNav(v))
    // watch(openBlank, v=> uiSetting.updateOpenBlank(v))

    const changeColor = name=>{
        uiSetting.setColor(name)
        M.info(`主配色切换为⌈${name}⌋`)
        // color.value = uiSetting.color
    }
</script>
