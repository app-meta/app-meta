<template>
    <n-card title="应用运行情况" size="small">
        <Status :aid="aid" />
    </n-card>

    <n-card title="部署新版本" class="mt-2" segmented size="small">
        <n-form :show-feedback="false" label-placement="top">
            <n-grid cols="8" x-gap="12">
                <n-form-item-gi label="版本号">
                    <n-input v-model:value="bean.version" size="large" placeholder="建议使用日历版本法" />
                </n-form-item-gi>
                <n-form-item-gi span="6" label="更新内容">
                    <n-input v-model:value="bean.summary" size="large" />
                </n-form-item-gi>

                <n-form-item-gi label="上传资源文件">
                    <Uploader action="/page/terminal/deploy" :data="bean" accept=".zip,.js,.jar" :noticeOnOk="false" @ok="uploadDone">
                        <n-button type="primary" block size="large"> <template #icon><n-icon :component="Upload" /></template> 上传资源包</n-button>
                    </Uploader>
                </n-form-item-gi>
            </n-grid>
        </n-form>
    </n-card>

    <VersionList ref="versionList" class="mt-2" :aid="aid" :pid="pid" height="calc(100vh - 405px)" />
</template>

<script setup>
    import { ref, reactive } from 'vue'
    import { PaperPlane, Upload } from "@vicons/fa"

    import Uploader from "@C/uploader.vue"
    import Status from "./status.vue"
    import VersionList from "../widget/version-list.vue"

    const props = defineProps({
        bean: {type:Object},
        aid: {type:String},
        pid: {type:[Number, String]}
    })

    let versionList = ref()

    const bean       = reactive({version:H.date.date(Date(), "YY.M.D"), summary:"", aid: props.aid, pid: props.pid })
    const uploadDone = ()=>{
        M.notice.ok(`后端服务⌈${props.aid}⌋的新版本⌈${bean.version}⌋已部署`)
        versionList.value.refresh()
        bean.summary = ""
    }
</script>
