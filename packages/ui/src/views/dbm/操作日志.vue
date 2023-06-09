<template>
    <n-space>
        <n-input v-model:value="form.EQ_uid" placeholder="用户ID" clearable />
        <n-select style="width:140px" placeholder="操作类型" v-model:value="form.EQ_action" :options="actionTypes()"></n-select>
        <n-button secondary circle type="success" @click="refresh">
            <template #icon><n-icon :component="Search" /> </template>
        </n-button>
    </n-space>

    <n-data-table class="mt-2" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans" :style="{height}"
        :remote="true" :bordered="false" striped size="small" flex-height />
</template>

<script setup>
    import { ref, h } from 'vue'
    import { useRoute } from 'vue-router'
    import { Search } from '@vicons/fa'

    import P from "@Pagination"

    import { actionTypes } from "."

    const id = useRoute().params.id

    let height = "calc(100vh - 105px)"
    let columns = [
        { title:"序号", align:"center", width:70, render:(row, index)=>index+1 },
        { title:"UID", key:"uid", width:80 },
        { title:"操作", key:"action", width:50 },
        { title:"对象", key:"target", width:180},
        { title:"耗时/ms", key:"used", width:80 },
        { title:"参数/操作内容", key:"ps", ellipsis:true},
        { title:"说明", key:"summary", ellipsis:true},
        { title:"创建日期", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) }
    ]

    let { beans , form, pagination, refresh } = P({url:`/dbm/source/log`, form:{EQ_sourceId: id, SORT_id:1}})
</script>
