<template>
    <n-button size="tiny" @click="showBack && router.back()" text :style="{color, width:'26px', height:'21px',marginLeft:'-10px'}">
        <template #icon><n-icon v-if="showBack" :component="ArrowLeft" /></template>
    </n-button>
</template>

<script setup>
    import { ref, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { ArrowLeft } from "@vicons/fa"

    const props = defineProps({color:{type:String, default:'white'}})

    const route = useRoute()
    const router = useRouter()

    let showBack = ref(route.name != "home")

    watch(route, v=>showBack.value = v.name != "home")
</script>
