<!--选择数据源（已授权）-->
<template>
    <n-select :options="beans" v-model:value="model" value-field="id" label-field="name" :render-label="renderLabel"></n-select>
</template>

<script setup>
    import { ref, onMounted,h } from 'vue'
    import { NSpace } from 'naive-ui'

    const model = defineModel()

    let beans = ref([])

    const renderLabel = o=> h(NSpace, ()=>[
        o.name,
        h('div', {class:"h"}, o.summary)
    ])

    onMounted(()=> RESULT("/dbm/source/list", {}, d=> beans.value = d.data) )
</script>
