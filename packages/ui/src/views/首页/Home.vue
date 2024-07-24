<template>
    <Notice clz="mb-3" />

    <!-- <LinkedApp /> -->
    <LinkedPage />

    <Top class="mt-3" />
</template>

<script setup>
    import { ref,onMounted } from 'vue'

    // import LinkedApp from "./已关注应用.vue"
    import LinkedPage from "./已关注页面.vue"
    import Top from "./应用TOP.vue"
    import Notice from "./公告.vue"
</script>
