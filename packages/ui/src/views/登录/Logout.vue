<template>
    <div style="width:640px;margin:100px auto;">
        <n-card segmented embedded>
            <template #header>
                <PowerOff class="error icon mr-1" /> 用户已登出
            </template>
            您好，当前用户已经退出平台，无法使用受限制的功能，如有需要，请先点此 <n-button @click="toHome" size="small" type="primary" secondary>进行登录</n-button>

            <div class="mt-2">
                <n-text depth="3">如有疑问，请联系系统管理员或技术人员。</n-text>
            </div>
        </n-card>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useRouter } from "vue-router"
    import { PowerOff } from "@vicons/fa"

    const router = useRouter()

    const toHome = ()=> router.replace({name:"home"})
</script>
