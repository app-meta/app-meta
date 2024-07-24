<template>
    <n-select :disabled="disabled" v-model:value="shadow" :options="options" :multiple="multiple" filterable clearable :placeholder="placeholder" @update:value="v=>emits('update:value', v)"/>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const emits = defineEmits(["value:update"])
    const props = defineProps({
        value: {type:[String, Number]},
        disabled:{type:Boolean, default:false},
        multiple:{type:Boolean, default:false},
        placeholder:{type:String, default:"选择人员"}
    })

    let shadow = ref(props.value)
    let options = ref([])

    onMounted(() => H.app.users().then(d=> options.value = d.data.map(v=>({label:`${v.name}(${v.id})`, value:v.id}))))
</script>
