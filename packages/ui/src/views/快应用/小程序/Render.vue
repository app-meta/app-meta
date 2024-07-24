<template>
    <object :data type="text/html" style="width: 100%; height: 100vh;"></object>
</template>

<script setup>
    import { ref } from 'vue'

    import { renderProps } from "../"

    const props = defineProps(renderProps)
</script>
