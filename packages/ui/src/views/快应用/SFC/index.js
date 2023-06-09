export const template = `<template>
    {{text}}，counter = {{count}}

    <div>
        <n-button type="primary" @click="()=>count++">点我+1</n-button>
    </div>
</template>
<script setup>
    import { ref } from 'vue'

    let text = ref("这是一个 SFC 模版")
    let count = ref(0)
</script>
`
