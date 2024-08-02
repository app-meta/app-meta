<template>
    <n-text depth="3" class="p-3">共 {{menus.length}} 篇文档</n-text>
    <n-menu :options="menus" :indent="20" v-model:value="current" @update:value="(v, item)=>emits('change', item)"/>
</template>

<script setup>
    import { ref, onMounted, h } from 'vue'
    import { NEllipsis } from 'naive-ui'

    import Title from "@V/widget/page.title.vue"

    const emits = defineEmits(["change"])
    const props = defineProps({page:{type:Object}})
    let menus   = ref([])
    let current = ref(props.page.id)

    onMounted(() => {
        RESULT("/page/list", {form:{EQ_aid:props.page.aid, EQ_template:"markdown", EQ_active:true, EQ_search:true}}, d=> {
            menus.value = d.data.map(p=>({
                name    : p.name,
                label   : ()=>h(NEllipsis, {tooltip:{placement:"right"}}, ()=>h(Title, {text: p.name})),
                key     : p.id,
                aid     : p.aid
            }))
        })
    })
</script>
