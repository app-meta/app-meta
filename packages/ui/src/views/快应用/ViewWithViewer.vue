<template>
    <Viewer :aid="aid" :pid="pid" :params="params" ref="viewer" :pure />
</template>

<script setup>
    import { ref, watch,onMounted, h, reactive, nextTick, onUnmounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    import Viewer from "./viewer.vue"

    const route = useRoute()
    const router = useRouter()

    const parseParams = p => p? JSON.parse(H.io.unCompress(decodeURIComponent(p))) : {}

    const loadParamsFromQuery = ()=>{
        window.pageParams = params.value = parseParams(route.query.params)
    }

    const pure = route.name == 'app-pure-view'
    let aid = ref(route.params.aid)
    let pid = ref(route.params.pid)
    let params = ref(parseParams(route.query.params))

    let viewer = ref()

    watch(route, ()=>{
        if(route.name == "app-view"){
            let { params } = route
            if(params.aid != aid.value || params.pid != pid.value){
                aid.value = params.aid
                pid.value = params.pid

                loadParamsFromQuery()
                nextTick(viewer.value.refresh)
            }
        }
        else if(route.name == "app-view-index"){
            location.reload()
        }
    })

    onMounted(() => {
        window.metaChangePage = (aid, pid)=>{
            router.push({name:"app-view", params:{aid, pid}})
        }
    })

    onUnmounted(() => delete window.metaChangePage)
</script>
