<template>
    <MdPreview v-if="code" :modelValue="code" :theme="dark?'dark':'light'" noIconfont :previewTheme :showCodeRowNumber :mdHeadingId/>
</template>

<script setup>
    import { MdPreview } from 'md-editor-v3'
    import 'md-editor-v3/lib/style.css'

    import { mdHeadingId, previewTheme, showCodeRowNumber } from "."
    import { ViewerProps } from ".."

    const props = defineProps(ViewerProps)
</script>
