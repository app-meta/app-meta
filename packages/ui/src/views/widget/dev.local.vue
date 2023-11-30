<!--本地项目配置页-->
<template>
    <n-alert :bordered="true" type="info" :show-icon="true">
        在客户端中打开本地开发中的前端项目，此功能用于小程序开发测试
        <div>如需使用当前登录用户信息，请勾选下方的 <Tag>注入用户</Tag> </div>
        <div>注意：此功能仅限客户端内</div>
    </n-alert>

    <n-form class="mt-2" :show-feedback="false">
        <n-space vertical>
            <n-form-item label="前端项目地址">
                <n-input v-model:value="url" />
            </n-form-item>
            <n-form-item label="是否注入用户 TOKEN">
                <n-switch v-model:value="inject" :disabled="!canInject"></n-switch>
            </n-form-item>
            <n-form-item label="TOKEN 名称（默认为 MUA）">
                <n-input v-model:value="tokenName" :disabled="!canInject || !inject" />
            </n-form-item>

            <n-button type="primary" @click="onOk" block>确定</n-button>
        </n-space>
    </n-form>

</template>

<script setup>
    import { ref } from 'vue'

    let canInject = window.isClient
    let url = ref('http://localhost:')
    let inject = ref(canInject)
    let tokenName = ref("MUA")

    const onOk = ()=>{
        if(!url.value)   return M.warn(`请输入地址`)

        if(!canInject) {
            H.openUrl(url.value, {type:""})
            M.notice.warn(`检测到非客户端环境，部分功能将受限制`, `打开本地前端项目`)
        }
        else
            API("open-local-url", url.value, inject.value?tokenName.value:"")
    }
</script>
