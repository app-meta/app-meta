<!--
    数据总览，展示当前数据总量
-->
<template>
    <n-card title="平台运行时" size="small">
        <n-grid :cols="4" :x-gap="gap" :y-gap="gap">
            <n-gi>
                <n-alert :show-icon="false" type="info" title="启动日期">
                    <n-text class="text-2xl">{{os.started}}</n-text>
                </n-alert>
            </n-gi>
            <n-gi>
                <n-alert :show-icon="false" type="info" title="处理器信息">
                    <n-text class="text-2xl">{{os.cpu}}</n-text>
                </n-alert>
            </n-gi>
            <n-gi>
                <n-alert :show-icon="false" type="info" title="内存占用">
                    <n-text class="text-2xl">{{os.memory}}/{{os.memoryMax}}<n-text depth="3" class="text-sm ml-1">MB</n-text></n-text>
                </n-alert>
            </n-gi>
            <n-gi>
                <n-alert :show-icon="false" type="info" title="线程总数">
                    <n-text class="text-2xl">{{os.threads}}<n-text depth="3" class="text-sm ml-1">个</n-text></n-text>
                </n-alert>
            </n-gi>
        </n-grid>
    </n-card>

    <n-card title="应用数据统计" size="small" class="mt-3">
        <n-grid :cols="cols" :x-gap="gap" :y-gap="gap">
            <n-gi v-for="item in bean">
                <n-alert :show-icon="false" :type="getTheme(item)" :title="item.label">
                    <n-text class="text-4xl">
                        <n-number-animation :from="0" show-separator :to="item.value" />
                        <n-text v-if="item.suffix" depth="3" class="text-sm ml-1">{{item.suffix}}</n-text>
                    </n-text>
                </n-alert>
            </n-gi>
        </n-grid>
    </n-card>

    <n-grid :cols="2" :x-gap="gap" class="mt-3">
        <n-gi>
            <n-card size="small" title="页面/功能类型分布">
                <Chart :style="{height: chartHeight+'px'}" ref="pieChart" pie legendBottom></Chart>
            </n-card>
        </n-gi>
        <n-gi>
            <n-card size="small" title="页面/功能热度TOP10">
                <Chart :style="{height: chartHeight+'px'}" ref="hotChart" :yCategory="topNameOnY"></Chart>
            </n-card>
        </n-gi>
    </n-grid>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    import Chart from "@C/chart.vue"

    import { findTemplate } from "../快应用"

    const cols          = 5
    const gap           = 15
    const chartHeight   = 400
    const topNameOnY    = false      //热度排行是否横向显示

    const pieChart      = ref()
    const hotChart      = ref()

    /*
    [
        { label:"应用数", value: 8, theme:"info", suffix:"个"},
        { label:"页面 / 功能", value: 27, theme:"success",suffix:"个" },
        { label:"关注", value: 98, theme:"warning", suffix:"则"},
        { label:"数据量", value: 18399, theme:"error", suffix:"条" },
        { label:"文档 / 附件", value: 76, suffix:"个", theme:"info"}
    ]
    */
    let bean = ref([])
    let os = ref({})

    const getTheme = item=> item.theme || UI.getTheme(item.value) //`${item.label}${item.value}`

    /**
     * 后端返回数据： { name01:1, name02: 2  }
     */
    const drawTop = d =>{
        let keys = topNameOnY ? H.util.reverse(Object.keys(d))  : Object.keys(d)
        hotChart.value.update(  keys, { type:"bar", name:"访问量", data: keys.map(key=> d[key]) })
    }

    const drawPie = d=> {
        let newD = {}
        Object.keys(d).forEach(key=> newD[findTemplate(key).text] = d[key])
        pieChart.value.update( null, UI.buildPieChart(newD, {radius: [20, chartHeight-250]}))
    }

    const refresh = d=>{
        bean.value = d.total
        os.value = d.platform
        drawTop(d.tops)
        drawPie(d.templates)
    }

    onMounted(() => RESULT("/system/dashboard/overview", {}, d=> refresh(d.data)) )
</script>
