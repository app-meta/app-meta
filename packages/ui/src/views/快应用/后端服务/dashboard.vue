<template>
    <n-card title="本应用服务访问总览">
        <n-spin :show="loading">
            <n-grid :x-gap="12" :cols="4">
                <n-gi><n-statistic label="总调用次数"><template #prefix><n-icon :component="Hourglass" /></template> {{overview.total}}</n-statistic></n-gi>
                <n-gi><n-statistic label="今日调用次数"><template #prefix><n-icon :component="HourglassEnd" /></template>{{overview.today}}</n-statistic></n-gi>
                <n-gi><n-statistic label="错误总数"><template #prefix><n-icon :component="Bug" /></template>{{overview.error}}</n-statistic></n-gi>
                <n-gi><n-statistic label="均耗时"><template #prefix><n-icon :component="Clock" /></template>{{overview.used}} ms</n-statistic></n-gi>
            </n-grid>
        </n-spin>
    </n-card>

    <LogList height="calc(100vh - 280px)" :aid="aid" />
</template>

<script setup>
    import { ref, onMounted, h } from 'vue'
    import { Bug, Clock,Hourglass,HourglassEnd } from '@vicons/fa'

    import LogList from "../widget/terminal-log.vue"

    const props = defineProps({
        aid:{type:String}
    })

    let overview = ref({})
    let loading = ref(true)

    onMounted(() => {
        RESULT("/page/terminal/log-overview", {id: props.aid}, d=>{
            let dd = d.data
            if(dd.used && dd.total) dd.used /= dd.total

            overview.value = dd
            loading.value = false
        })
    })
</script>
