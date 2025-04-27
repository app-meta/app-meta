<template>
    <n-form :show-feedback="false">
        <n-space vertical>
            <n-alert type="info" :bordered="false">通过注入网页调试工具<br>针对无法正常打开<Tag>开发者工具</Tag>的网页</n-alert>
            <n-form-item label="目标网址"><n-input placeholder="请输入网址" v-model:value="url"></n-input></n-form-item>
            <n-form-item label="调试工具">
                <n-radio-group v-model:value="debuger">
                    <n-radio v-for="item in debugers" :value="item.name">{{ item.label }}</n-radio>
                </n-radio-group>
            </n-form-item>
            <n-form-item label="窗口宽度（单位 px）">
                <n-space>
                    <n-input-number :bordered="true" style="width: 140px;" v-model:value="width" min="100" step="50">
                        <template #prefix> <Tag>宽</Tag></template>
                    </n-input-number>
                    <n-input-number :bordered="true" style="width: 140px;" v-model:value="height" min="100" step="50">
                        <template #prefix> <Tag>高</Tag> </template>
                    </n-input-number>
                </n-space>
            </n-form-item>
            <div class="text-right">
                <n-button @click="onOk" size="large" type="primary">确定</n-button>
            </div>
        </n-space>
    </n-form>
</template>

<script setup>
    import { ref } from 'vue'

    import { getDebugers, debugForUrl } from "@V/快应用/网页机器人"

    const debugers = getDebugers()

    let url = ref("")
    let debuger = ref()
    let width = ref(1280)
    let height = ref(720)

    const onOk = ()=>{
        if(!url.value)      return M.warn(`请输入网址`)

        let buger = debugers.find(v=>v.name==debuger.value)
        if(!buger)    return M.warn(`请选择调试工具`)

        buger.windowWidth = width.value
        buger.windowHeight = height.value

        debugForUrl(url.value, buger)
    }
</script>
