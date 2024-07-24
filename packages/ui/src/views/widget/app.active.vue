<!--应用激活组件-->
<template>
    <n-switch :round="round" :default-value="value" :on-update:value="onChange">
        <template v-if="showText" #checked> 启用 </template>
        <template v-if="showText" #unchecked> 禁用 </template>
    </n-switch>
</template>

<script setup>
    import { ref } from 'vue'

    const props = defineProps({
        id:{type:String},
        round:{type:Boolean, default:true},
        value:{type:Boolean, default:false},
        showText:{type:Boolean, default:false}
    })

    let onChange = value=> RESULT("/app/modify", {id:props.id, key:"active", value}, d=>M.info(`应用⌈${props.id}⌋已${value?"启用":"禁用"}`))
</script>
