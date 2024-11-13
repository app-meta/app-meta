<template>
    <object :data="url" type="text/html" style="width: 100%; height: 100vh;"></object>
</template>

<script setup>
    import { ref } from 'vue'

    import { renderProps } from "../"

    const props = defineProps(renderProps)

    const url = `${props.data}?t=${Date.now()}`
</script>
