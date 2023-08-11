<!--
# 示例

## 饼状图

# html 元素
<Chart :style="{height: chartHeight+'px'}" ref="pieChart" pie legendBottom></Chart>

# 定义引用
let pieChart = ref()

# 更新图表数据，可以直接从 echarts 官网中拷贝出来，下面是 南丁格尔玫瑰图 的示例
pieChart.value.update(
    null,
    [
        {
        type: 'pie',
        radius: [20, 200],
        roseType: 'area',
        itemStyle: {
            borderRadius: 10
        },
        selectedMode:"single",
        data: [
            { value: 30, name: 'rose 1' },
            { value: 28, name: 'rose 2' },
            { value: 26, name: 'rose 3' },
            { value: 24, name: 'rose 4' },
            { value: 22, name: 'rose 5' },
            { value: 20, name: 'rose 6' },
            { value: 18, name: 'rose 7' },
            { value: 16, name: 'rose 8' }
        ]
        }
    ]
)
-->
<template>
    <div class="w-full h-full" ref="container"></div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    /**
     * import echarts from 'echarts'
     * 或者
     * import * as echarts from 'echarts'
     * 完整导入 echarts ，打包后单个文件大小 804 kb，总大小 3.05M
     *
     * 按需导入后，打包单个文件大小 430 kb
     *
     * 2021年9月6日 更新为 echarts-5.x  ，默认配色为：['#5470c6','#91cc75','#fac858','#ee6666','#73c0de','#3ba272','#fc8452','#9a60b4','#ea7ccc']
     */
    // 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
    const echarts = require('echarts/lib/echarts')
    //引入图表类型
    require("echarts/lib/chart/bar")                //引入柱状图
    require("echarts/lib/chart/line")               //引入折线图
    require("echarts/lib/chart/pie")                //引入饼图
    require('echarts/lib/chart/radar')              //引入雷达图
    require('echarts/lib/chart/gauge')              //引入仪表盘
    require('echarts/lib/chart/tree')               //引入树图
    require('echarts/lib/chart/graph')              //引入关系图
    require('echarts/lib/chart/map')                //引入地图

    //引入工具
    require("echarts/lib/component/tooltip")
    require("echarts/lib/component/title")
    require("echarts/lib/component/toolbox")
    require("echarts/lib/component/legend")
    require("echarts/lib/component/markPoint")
    require("echarts/lib/component/grid")
    require("echarts/lib/component/polar")
    require('echarts/lib/component/visualMap')
    require('echarts/lib/component/geo')

    const props = defineProps({
        markLineAvg:{type: Boolean, default: false}, //是否显示平均值标记
        markPointMax:{type:Boolean, default:false},  //是否特殊标记每个 serie 的最大最小值
        pie: {type:Boolean, default:false},         //是否显示饼状图
        boundaryGap: {default:true},                //坐标轴两边留白策略
        toolbox: {type:Boolean, default:true},      //是否显示工具栏
        interval:{default:"auto"},                  //设置为0即可强制显示 X 轴的全部标签
        xRotate:{type:Number, default:0},           //X轴的文字旋转角度
        legendBottom:{type:Boolean, default:false}, //是否将 legend 在底部显示，默认在顶部
        yCategory:{type:Boolean, default: false},   //是否Y轴显示分类（横向柱状图）
    })

    const grid = {
        left: '1%',
        bottom:'2%',
        right:'1%',
        top: 35,
        containLabel: true
    }
    const tooltip = {
        trigger: "axis",
        axisPointer: {
            type:"cross",
            label:{ backgroundColor:"#6a7985", precision:0}
        }
    }
    const pieTooltip = {
        trigger: "item",
        formatter: `{b}：{c} ({d}%)`
    }
    const toolbox = {
        feature: { dataZoom:{}, dataView:{readOnly:true}, magicType:{type:['line','bar']},saveAsImage:{}, restore:{},  }
    }

    let container = ref()
    let chart

    /**
     * 更新图表内容
     *
     * @param {*} xItems    x轴分类
     * @param {*} series
     * @param {*} ps        更多信息
     *                          title   图表标题
     *                          danwei  单位（显示在 y轴 数值后方）
     *                          customColor 自定义颜色（数组）
     *                          dispatchs   图表指令，详见 https://echarts.apache.org/zh/api.html#echartsInstance.dispatchAction
     */
    let update = (xItems=[], series=[], ps={})=>{
        ps = Object.assign({title:"", danwei:"", customColor: null, dispatchs:[]}, ps)
        let option = {
            title:{text:ps.title},
            tooltip: props.pie? pieTooltip: tooltip,
            grid,
            legend:{ bottom: props.legendBottom?0:"auto"},
            series: (Array.isArray(series)? series : [series]).map(s=>{
                return Object.assign({
                    type:"line",
                    smooth:true,
                    areaStyle:{opacity: 0.8},
                    markLine: props.markLineAvg? (props.pie?{}: {data:[{type:'average'}]}) : undefined,
                    markPoint: props.markPointMax? { data:[{type: 'max'},{type: 'min'}]}: undefined
                }, Array.isArray(s)? {data: s}: s)
            })
        }
        option[props.yCategory?"yAxis":"xAxis"] = props.pie? undefined: {
            type:"category",
            boundaryGap: props.boundaryGap,
            axisLabel:{interval: props.interval, xRotate:props.xRotate },
            data: xItems
        }
        option[props.yCategory?"xAxis":"yAxis"] = props.pie? undefined: {
            type:"value",
            splitLine:{ show: true, lineStyle:{width:1} },
            axisLabel:{
                formatter:'{value} '+ps.danwei
            }
        }
        if(ps.legend)       option.legend = ps.legend
        if(props.toolbox)   option.toolbox = toolbox
        if(ps.customColor)  option.color = ps.customColor

        chart.setOption(option)
        if(ps.dispatchs && ps.dispatchs.length){
            ps.dispatchs.forEach(a=> chart.dispatchAction(a))
        }
    }
    //直接覆盖配置
    let setOption = ops=> chart.setOption(Object.assign({grid, title:undefined}, ops))
    let showEmpty = (text="暂无数据")=> {
        chart.clear()
        chart.setOption({
            title:{
                text,
                textStyle:{
                    color:"#CCC",
                    fontSize: "2rem"
                },
                top:'center',
                left:'center'
            }
        })
    }

    onMounted(() => {
        chart = echarts.init(container.value)
    })

    defineExpose({ update, setOption, showEmpty })
</script>
