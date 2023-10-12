<template>
    <n-layout position="absolute">
        <n-layout position="absolute" style="top: 0px;bottom:36px;" class="layout"  :content-style="{padding: padding+'px'}" :native-scrollbar="false">
            <router-view />

            <BottomMenu />
        </n-layout>
        <n-layout-footer position="absolute" style="height: 36px; padding:6px; text-align: center;" bordered>
            <component :is="footer" />
        </n-layout-footer>
    </n-layout>
</template>

<script setup>
    import { ref,h } from 'vue'
    import Banner from "@CC/Banner.vue"

    import BottomMenu from "./bottom-menu-editor.vue"

    let footer = h(Banner, {text: Config.footer||undefined})

    let padding = ref(12)
    E.on("main.padding", (v=12)=> padding.value=v)
</script>
