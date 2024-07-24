<template>
    <n-grid :x-gap="12" :y-gap="12" :cols="colSpan">
        <n-gi v-for="item in beans" :span="item.col||2">
            <n-card size="small" :title="item.title">
                <component :is='renderItem(item)' />
            </n-card>
        </n-gi>
    </n-grid>
</template>

<script setup>
    import { ref, onMounted, nextTick, h } from 'vue'

    import { renderProps, loadContent } from "../"
    import { CHART, TABLE, TEXT, colSpan } from "./"
    import { renderItem } from "./widget"

    const props = defineProps(renderProps)

    let beans = ref(props.data? JSON.parse(props.data):{})
</script>
