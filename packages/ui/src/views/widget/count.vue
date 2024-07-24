<template>
    <span :title="value">{{text}}</span>
</template>

<script setup>
    import { ref, computed } from 'vue'

    const props = defineProps({ value: {type:Number, default: 0} })

    const options = [
        { value:0, text:"" },
        { value:1E3, text:"K" },
        { value:1E6, text:"M" }
    ]

    /**
     * 仅处理到百万级别
     */
    const text = computed(()=> {
        if(props.value<1E3)    return props.value
        let isK = props.value<1E6

        return (props.value / (isK ? 1E3:1E6)).toFixed(1) + (isK?"k":"m")
    })
</script>
