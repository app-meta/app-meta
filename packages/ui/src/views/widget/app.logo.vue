<!--应用图标展示组件-->
<template>
    <n-avatar :style="{ backgroundColor: color }" :size="size" :round="round">
        {{text}}
    </n-avatar>
</template>

<script setup>
    import { ref, computed } from 'vue'

    const props = defineProps({
        text:{type:String},
        round:{type:Boolean, default: true },
        size:{type:[String, Number], default:"large"}
    })

    const pantongColors = ['#BB2649', '#6667AB', '#939597', '#F5DF4D', '#0F4C81', '#FF6F61', '#5F4B8B', '#88B04B', '#F7CAC9', '#92A8D1', '#955251', '#B565A7', '#009B77', '#E2492F', '#CB6586', '#45B5AA', '#F0C05A', '#5A5B9F', '#9B1B30', '#DECDBE', '#53B0AE', '#E2583E', '#7BC4C4', '#BF1932', '#C74375', '#98B2D1']

    //随机返回一个颜色
    function pantongColor(){
        return pantongColors[H.hashCode(props.text) % pantongColors.length]
    }

    let color = computed(()=> pantongColor())
</script>
