<!--嵌套内容，使用 object 标签-->
<template>
    <object :data="url" type="text/html" :width="width" :height="height"></object>
</template>

<script setup>
    import { ref } from 'vue'

    const props = defineProps({
        url:{type:String},
        width: {type:[String, Number], default:"100%"},
        height: {type:[String, Number], default:"100%"}
    })
</script>
