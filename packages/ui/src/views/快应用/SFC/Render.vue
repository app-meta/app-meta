<template>
    <SFCRender ref="sfc" :code="data" :done="onLoad" />

    <DocumentList v-if="ok" class="mt-4" :pid="page.id" />
</template>

<script setup>
    import { ref, reactive, onMounted, nextTick, computed } from 'vue'

    import DocumentList from "../document-list.vue"

    import { renderProps, loadContent } from "../"
    import SFCRender from "./sfc-render.vue"

    const props = defineProps(renderProps)

    let ok = ref(false)

    const onLoad = ()=> ok.value = true
</script>
