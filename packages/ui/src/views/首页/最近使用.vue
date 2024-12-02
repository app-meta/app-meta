<template>
    <n-card title="最近使用" size="small">
        <template #header-extra>
            <n-popconfirm :negative-text="null" @positive-click="clearHistory">
                <template #trigger>
                    <n-button size="tiny" tertiary type="error">清空</n-button>
                </template>
                删除全部本地访问记录，确定吗？
            </n-popconfirm>

        </template>
        <n-text v-if="!beans.length" depth="3">暂无数据</n-text>
        <n-list v-else clickable hoverable>
            <n-list-item v-for="item in beans" style="padding: 12px 2px 0px 8px;">
                <n-thing @click="runPage(item)">
                    <!-- <template #avatar><n-icon size="20" :component="item.template.icon" :class="item.template.theme" /></template> -->
                    <template #header><n-ellipsis :line-clamp="1"><Title size="small" :text="item.name" /></n-ellipsis></template>
                </n-thing>
            </n-list-item>
        </n-list>
    </n-card>
</template>

<script setup>
    import { onMounted, ref } from 'vue'
    import { useHistory } from "@CP"

    import { runPage } from "@S/Runner"

    // import { findTemplate } from "@V/快应用"
    import Title from "@V/widget/page.title.vue"

    const { getHistoryList, clearHistory } = useHistory()
    let beans = ref([])

    const time = v=>H.date.datetime(v)

    onMounted(() => {
        getHistoryList().then(v=>{
            // v.forEach(vv=> vv.template=findTemplate(vv.template))
            beans.value = v.sort((a,b)=>b.date-a.date)
        })
    })
</script>
