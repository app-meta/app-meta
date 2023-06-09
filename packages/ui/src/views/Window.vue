<template>
    <n-layout position="absolute">
        <!--如需头部，设置 style top: 50px;-->
        <!--如需使用 naive-ui 提供的滚动条，则应该设置  :native-scrollbar="false" 同时 content-style 的 height 设置为自动 -->
        <n-layout position="absolute" style="top: 0px;bottom:36px;" class="layout"  :content-style="{padding: padding+'px'}" :native-scrollbar="false">
            <router-view />
        </n-layout>
        <n-layout-footer position="absolute" style="height: 36px; padding:6px; text-align: center;" bordered>
            <component :is="footer" />
        </n-layout-footer>
    </n-layout>
</template>

<script setup>
    import { ref,h } from 'vue'
    import Banner from "@CC/Banner.vue"

    let footer = h(Banner, {text: Config.footer||undefined})

    let padding = ref(12)
    E.on("main.padding", (v=12)=> padding.value=v)
</script>
