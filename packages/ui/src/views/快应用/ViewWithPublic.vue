<!-- 公开访问（目前仅支持SFC、文档页公开访问） -->
<template>
    <n-spin v-if="loading" large></n-spin>
    <component v-else :is="viewer()" />
</template>

<script setup>
    import { h, ref, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    import SFCRender from "./SFC/Render.vue"

    const route = useRoute()

    let pid = route.params.pid
    const channel =  window.isClient?"client":"browser"

    let loading = ref(true)
    let bean = {}

    let viewer  = ()=> {
        let tpl = bean.template
        let com =
            tpl =='sfc'?         SFCRender:
            null

        return h(com, { data:bean.content, aid:bean.aid })
    }

    onMounted(() => {
        RESULT("/page/public-view", { pid, channel },  d=>{
            bean = d.data
            loading.value = false
        })
    })
</script>
