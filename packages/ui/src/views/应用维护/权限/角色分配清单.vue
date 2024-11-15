<template>
    <n-data-table :columns :data :style="{height}"
        :bordered="false" striped size="small" flex-height />
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const props = defineProps({
        height: {type:String},
        aid:{type:String}
    })

    let data = ref([])
    const columns = [
        { title:"用户ID", width:120, key:"uid" },
        { title:"角色", key:"role" }
    ]

    onMounted(() => data.value.length==0 && RESULT("/app/role/links", {aid:props.aid},d=> data.value=d.data))
</script>
