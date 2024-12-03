<template>
    <n-alert :bordered="false" title="可通过以下两种方式写入应用日志：" show-icon type="info">
        <div>1、在后端服务的响应添加<Tag>meta-log</Tag>头信息，其值即为日志内容（请使用 <b class="info">x-www-url-encoded</b> 编码）</div>
        <div>2、在浏览器通过<Tag>H.app.log</Tag></div>
    </n-alert>

    <n-data-table class="mt-2" :columns :pagination :loading="pagination.loading" :data="beans" :style="{height}" :bordered="false" remote striped size="small" flex-height />
</template>

<script setup>
    import { useRoute } from 'vue-router'
    import P from "@Pagination"

    const route = useRoute()
    let aid = route.params.aid

    let { beans , form, pagination, refresh } = P({url:`/app/log-list-${aid}`, form:{ SORT_id:1 }})

    let height = "calc(100vh - 170px)"
    const columns = [
        {title:"ID", key:"id", width:70},
        {title:"用户ID",key:"uid", width:100},
        {title:"渠道",key:"channel",width:100},
        {title:"内容",key:"msg", ellipsis:true},
        {title:"日期",key:"addOn", render:r=>H.date.datetime(r.addOn), width:180}
    ]
</script>
