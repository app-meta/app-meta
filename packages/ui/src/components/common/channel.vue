<template>
    <n-icon :component="bean.icon" :title="bean.text" :class="bean.theme" />
</template>

<script setup>
    import { ref } from 'vue'
    import { Chrome, Windows, MobileAlt, Terminal, Code, QuestionCircle } from '@vicons/fa'

    const props = defineProps({channel:{type:String, default:"browser"}})

    const channels = {
        client:{ icon: Windows, theme:"info", text:"客户端" },
        mobile:{ icon:MobileAlt, theme:"warning", text:"移动端" },
        cli: { icon:Terminal, theme:"error", text:"命令行工具" },
        browser: { icon:Chrome, theme:"success", text:"浏览器" },
        faas: {icon:Code, theme:"purple", text:"FaaS函数" }
    }

    const bean = channels[props.channel] || { icon: QuestionCircle, theme:"", text:"未知" }
</script>
