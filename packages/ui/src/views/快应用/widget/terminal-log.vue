<!--后端服务访问记录-->
<template>
    <n-space v-if="query">
        <n-input v-model:value="form.EQ_aid" placeholder="应用ID" clearable />
        <n-input v-model:value="form.EQ_uid" placeholder="用户ID" clearable />
        <n-button secondary circle type="success" @click="refresh">
            <template #icon><n-icon :component="Search" /> </template>
        </n-button>
    </n-space>

    <n-data-table :class="query?'mt-2':''" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans" :style="{height}"
        :remote="true" :bordered="false" striped size="small" flex-height />
</template>

<script setup>
    import { ref,h, computed } from 'vue'
    import { NTooltip, NTag } from 'naive-ui'
    import { Search } from "@vicons/fa"

    import P from "@Pagination"

    import Channel from "@CC/channel.vue"

    const props = defineProps({
        height:{type:String, default:"400px"},
        query:{type:Boolean, default:false},
        aid:{type:String}
    })

    let { beans , form, pagination, refresh } = P(props.aid?`/page/terminal/trace-${props.aid}`:`/system/terminal/trace`)

    const columns = computed(()=>{
        let cs = [{ title:"序号", align:"center", width:60, render:(row, index)=>index+1 }]
        if(props.query)
            cs.push({ title:"应用", width:140, key:"aid" })
        cs.push(...[
            { title:"终端", key:"channel", width:45, render:row=> h(Channel, {channel:row.channel})},
            { title:"用户", key:"uid", width:100 },
            { title:"method", key:"method", width:100 },
            {  title:"服务地址", key:"host" },
            { title:"PATH", key:"url" },
            { title:"耗时（ms）", key:"used", width:100 },
            {
                title:"响应码", key:"code", width:100,
                render: row=> row.code == 200?
                    h(NTag, {bordered:false, type:"success"}, ()=>row.code)
                    :
                    h(NTooltip, {placement:"left-start"}, {
                        default: ()=> [
                            h(NTag, {bordered: false, type:"error", size:"small"}, ()=>"错误信息"),
                            h('div',{class:"mt-2"}, row.summary)
                        ],
                        trigger: ()=> h(NTag, {bordered:false, type:"error"}, ()=>row.code),
                    })
            },
            { title:"访问日期", key:"addOn", width: 170, render: row=> H.date.datetime(row.addOn) }
        ])
        return cs
    })
</script>
