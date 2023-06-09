<!--显示我的已关注页面-->
<template>
    <n-card class="hover">
        <template #header>
            <n-tooltip>
                <template #trigger>
                    <n-tag size="large" @click="refreshCache" :bordered="false" type="primary" class="text-lg cursor-pointer">我的快捷功能</n-tag>
                </template>
                这里显示你关注的功能页面（看不到已经关注的功能页面时请使用此按钮进行强制刷新）
            </n-tooltip>
        </template>
        <template #header-extra>
            <router-link class="hover-item" to="/mine/link" title="管理我的关注">
                <n-button circle size="small" plain type="primary" quaternary>
                    <template #icon><n-icon :component="Cog" class="icon" /></template>
                </n-button>
            </router-link>
        </template>

        <template v-if="beans.length>0">
            <n-grid :cols="cols" responsive="screen" x-gap="10">
                <n-gi v-for="(item, index) in beans">
                    <n-button block secondary  @click="runPage(item)">
                        <template #icon><n-icon :component="item.tpl.icon" :class="item.tpl.theme" /></template>
                        <!-- {{item.name}} -->
                        <n-ellipsis><Title :text="item.name" /></n-ellipsis>
                    </n-button>
                </n-gi>
            </n-grid>
        </template>
        <div v-else class="h">您收藏的功能页面会显示在此处，方便快速访问</div>
    </n-card>
</template>

<script setup>
    import { ref, shallowRef, onMounted } from 'vue'
    import { SyncAlt, Sync, Wrench, Cog } from '@vicons/fa'

    import { runPage } from "@S/Runner"
    import { findTemplate } from "../快应用"
    import Title from "@V/widget/page.title.vue"

    const props = defineProps({
        cols:{type:[Number, String], default: "4 xs:2 s:3 m:4 xl:6" }
    })

    let beans   = shallowRef([])

    const load = ()=> RESULT("/page/link/list", {}, d=> {
        d.data.forEach(v=> v.tpl = findTemplate(v.template))
        beans.value = d.data
    })
    const refreshCache = ()=> RESULT("/page/link/refresh", {}, d=>{
        M.ok(`快捷功能（已关注页面）缓存已刷新`)
        load()
    })
    onMounted( load )
</script>
