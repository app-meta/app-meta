<template>
    <n-spin :show="!bean.name">
        <n-grid :x-gap="10" :y-gap="20" :cols="4">
            <n-gi>
                <n-alert :show-icon="false" :type="bean.status=='online'?'success':'default'" title="运行状态">
                    <n-space justify="space-between">
                        <n-text class="text-2xl">
                            <template v-if="bean.status">
                                <i v-if="bean.status=='online'" class="fa fa-check-circle success"></i>
                                <i v-else class="fa fa-stop warning"></i>
                            </template>

                            {{terminalStatus[bean.status]}} / {{bean.status}}</n-text>
                        <n-button-group>
                            <n-button type="error" @click="restart" :loading="loading" tertiary title="执行重启操作（如果未运行则尝试启动）">重启</n-button>
                            <n-button type="error" @click="stop" :loading="loading" tertiary title="停止服务">停止</n-button>
                        </n-button-group>
                    </n-space>
                </n-alert>
            </n-gi>
            <n-gi>
                <n-alert :show-icon="false" type="info" title="CPU占用">
                    <n-text class="text-2xl">{{bean.cpu}} %</n-text>
                </n-alert>
            </n-gi>
            <n-gi>
                <n-alert :show-icon="false" type="warning" title="内存占用">
                    <n-text class="text-2xl">{{mem}}</n-text>
                </n-alert>
            </n-gi>
            <n-gi>
                <n-alert :show-icon="false" type="error" title="最后启动日期">
                    <n-text class="text-2xl">{{date}}</n-text>
                </n-alert>
            </n-gi>
        </n-grid>
    </n-spin>
</template>

<script setup>
    import { ref, onMounted,computed } from 'vue'

    import { terminalStatus } from "@S/FastApp"

    const props = defineProps({
        aid:{type:String}
    })

    let bean = ref({})
    let loading = ref(false)

    const refresh = ()=> RESULT("/page/terminal/overview", {id:props.aid},d=>bean.value=d.data)
    const mem = computed(()=> H.filesize(bean.value.mem))
    const date = computed(()=> bean.value.uptime? H.date.datetime(bean.value.uptime):"-")
    const restart = ()=> M.confirm(`重启后端服务`, `确认重启（若应用未运行，则尝试直接启动）吗？`, ()=>RESULT("/page/terminal/restart", {id:props.aid}, refresh, {loading}))
    const stop = ()=> M.confirm(`停止服务`, `确认停止该服务吗？`, ()=> RESULT("/page/terminal/stop", {id:props.aid}, refresh, {loading}))
    onMounted( refresh )
</script>
