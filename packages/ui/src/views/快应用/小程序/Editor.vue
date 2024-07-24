<!--版本更新-->
<template>
    <n-card title="部署新版本" segmented size="small">
        <n-form :show-feedback="false" label-placement="top">
            <n-grid cols="8" x-gap="10">
                <n-form-item-gi label="版本号">
                    <n-input v-model:value="bean.version" placeholder="建议使用日历版本法" />
                </n-form-item-gi>
                <n-form-item-gi span="6" label="更新内容">
                    <n-input v-model:value="bean.summary" />
                </n-form-item-gi>

                <n-form-item-gi label="仅限 ZIP 格式">
                    <Uploader action="/page/h5/deploy" :data="bean" accept=".zip" :noticeOnOk="false" @ok="uploadDone">
                        <n-button type="primary" block>上传资源包</n-button>
                    </Uploader>
                </n-form-item-gi>
            </n-grid>
        </n-form>
    </n-card>

    <VersionList ref="versionList" class="mt-2" :aid="aid" :pid="id" height="calc(100vh - 270px)" />
</template>

<script setup>
    import { ref, reactive, h, onMounted } from 'vue'
    import { useRoute } from 'vue-router'

    import Uploader from "@C/uploader.vue"
    import P from "@Pagination"

    import VersionList from "../widget/version-list.vue"

    let height      = "calc(100% - 140px)"
    let {id, aid}   = useRoute().params
    const bean      = reactive({version:H.date.date(Date(), "YY.M.d"), summary:"", aid, pid: id })
    const columns   = [
        { title:"版本号", key:"version", width: 100 },
        { title:"发布者", width:120, key:"uid"},
        { title:"文件大小", width:90, render:(row)=> h('span', H.filesize(row.size))},
        { title:"说明", key:"summary",ellipsis:true },
        { title:"部署日期", key:"addOn", width: 170, render: row=> H.date.datetime(row.addOn) },
    ]
    let beans = ref([])

    let versionList = ref()

    let uploadDone = d=>{
        M.notice.ok(`新版本⌈${bean.version}⌋已部署（文件总数 ${d.data.split("<br>").length} 个）`)
        versionList.value.refresh()
    }
</script>
