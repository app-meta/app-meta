<template>
    <n-spin :show="loading">
        <Chart ref="chart" :toolbox="toolbox" :pie="type=='pie'" :style="{height: height+'px'}" legendBottom />
    </n-spin>
</template>

<script setup>
    import { ref, onMounted, watch, nextTick } from 'vue'

    import Chart from "@C/chart.vue"
    import { widgetProps, loadData } from "."

    const props = defineProps(widgetProps({
        type:   {type:String, default: "line"},
        mode:   {type:String},
        toolbox:{type:Boolean, default: false}
    }))

    let chart = ref()

    const onChartUpdate = ()=> {
        if(props.mode=='option')
            return chart.value.setOption(content.value)

        nextTick(()=>{
            if(props.type == "pie")
                chart.value.update(null, UI.buildPieChart(content.value, {radius:[20, props.height-190]}))
            else {
                let { xItems, series } = UI.buildChart(content.value, {type:props.type})
                chart.value.update(xItems, series)
            }
        })
    }

    let { loading, content } = loadData(props, onChartUpdate)

    watch(()=>[props.type], onChartUpdate)
</script>
