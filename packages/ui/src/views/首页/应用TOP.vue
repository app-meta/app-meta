<template>
    <n-spin :show="loading">
        <n-card>
            <template #header> <n-tag size="large" :bordered="false" type="primary" class="text-lg">应用市场</n-tag> </template>
            <template #header-extra>
                <n-tabs type="line" size="small" :on-update:value="onTopChange">
                    <n-tab name="newest">最新发布</n-tab>
                    <n-tab name="launch">人气热门</n-tab>
                </n-tabs>
            </template>

            <n-grid cols="2 m:4 xl:6" responsive="screen" :x-gap="12" :y-gap="12">
                <n-gi v-for="item in beans">
                    <AppCard :runable="true" :showAction="true" :bean="item" />
                </n-gi>
            </n-grid>
        </n-card>
    </n-spin>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    import AppCard from "@VW/app.card.vue"

    let beans = ref([])
    let loading = ref(false)
    let orderBy = "newest"

    const refresh = ()=> RESULT("/app/top", {key: orderBy}, d=> beans.value = d.data, {loading})

    const onTopChange = v => {
        if(orderBy == v)    return

        orderBy = v
        refresh()
    }

    onMounted( refresh )
</script>
