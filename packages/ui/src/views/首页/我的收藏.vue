<template>
    <n-card>
        <template #header> <n-tag size="large" :bordered="false" type="primary" class="text-lg">我收藏的应用</n-tag> </template>
        <template #header-extra>
            <n-space size="small">
                <n-tooltip trigger="hover" v-for="item in types">
                    <template #trigger>
                        <n-button text size="small" @click="change(item.value)" :type="showType==item.value?'primary':''"> <n-icon :component="item.icon" /> </n-button>
                    </template>
                    {{item.text}}
                </n-tooltip>
            </n-space>
        </template>

        <template v-if="beans.length>0">
            <n-space v-if="showType=='image'" size="small">
                <n-button v-for="item in beans" size="large" text @click="toRun(item.id)" :title="item.name">
                    <Logo :text="item.abbr" size="large" />
                </n-button>
            </n-space>

            <n-space v-else-if="showType=='button'">
                <n-button v-for="item in beans" size="large" secondary @click="toRun(item.id)">
                    <Logo :text="item.abbr" size="small" class="mr-1" />
                    {{item.name}}
                </n-button>
            </n-space>

            <n-grid v-else-if="showType=='card'" :cols="8" x-gap="10">
                <n-gi v-for="(item, index) in beans">
                    <AppCard :bean="item" :show-action="true" marked :show-footer="false" @unmark="onUnMark(index)" />
                </n-gi>
            </n-grid>
        </template>
        <div v-else class="h">您收藏的应用会显示在此处</div>
    </n-card>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { DotCircle, Image, CircleRegular, Circle } from "@vicons/fa"

    import Logo from "@VW/app.logo.vue"
    import AppCard from "@VW/app.card.vue"

    import { runApp } from "@S/Runner"

    const KEY = "index.mark"

    let showType = ref(Store.get(KEY, "button"))
    // let beans = ref(await RESULT2("/app/link/marked"))
    let beans = ref([])

    let types = [
        { value:"image", icon: CircleRegular, text:"简洁模式，只显示应用图标" },
        { value:"button", icon: DotCircle, text:"默认模式，显示应用图标及名称" },
        { value:"card", icon: Circle, text:"详细模式，显示较为完整的应用信息" },
    ]

    const change = v=>{
        showType.value = v
        Store.set(KEY, v)
    }
    const onUnMark = i=> beans.value.splice(i, 1)

    const toRun = id=>runApp(id)

    onMounted(()=> RESULT("/app/link/marked", {}, d=> beans.value = d.data) )
</script>
