<!-- 视频页编辑 -->
<template>
    <n-card title="视频设置" segmented size="small">
        <n-form :show-feedback="false" label-placement="left" label-width="100px">
            <n-space vertical>
                <n-form-item label="画面宽高比">
                    <n-select v-model:value="bean.ratio" :options="ratios" />
                </n-form-item>
                <n-form-item label="显示基本信息">
                    <n-switch v-model:value="bean.showInfo" />
                    <n-text class="ml-2" depth="3">勾选后将显示视频的大小、上传者、日期等信息</n-text>
                </n-form-item>
                <n-form-item label="描述信息">
                    <n-input v-model:value="bean.summary" type="textarea" />
                </n-form-item>
                <n-form-item label="更新视频">
                    <Uploader action="/page/document-upload" :data accept=".mp4" showFileList :noticeOnOk="false" @ok="uploadDone">
                        <n-button type="primary" secondary>上传视频文件</n-button>
                        <n-text class="ml-2" depth="3">仅支持 MP4 格式，重新生成将覆盖原视频</n-text>
                        <div v-if="bean.id || bean.size" class="mt-1">
                            <n-tag size="small" :bordered="false">{{ bean.addOn? toDate(bean.addOn) : "" }}</n-tag>
                            已上传视频 
                            <n-tag size="small" :bordered="false">{{ bean.file}}</n-tag> ，大小为 
                            <n-tag size="small" :bordered="false">{{ filesize(bean.size) }}</n-tag>
                        </div>
                    </Uploader>
                </n-form-item>
                <n-form-item label="高亮时间点">
                    <n-space vertical class="w-full">
                        <n-input v-model:value="bean.highlight" type="textarea" placeholder="在进度条上显示高亮信息"/>
                        <n-text class="ml-2" depth="3">
                            一行一个高亮，格式为
                            <n-tag size="small" :bordered="false">秒数（空格）文本</n-tag>，示例：
                            10 前方高能
                        </n-text>
                    </n-space>
                </n-form-item>
                
                <div class="text-center">
                    <n-button type="primary" @click="toSave" size="large">更新视频配置信息</n-button>
                </div>
            </n-space>
        </n-form>
    </n-card>
</template>

<script setup>
    import { ref, reactive, h, onMounted, computed } from 'vue'
    import { useRoute } from 'vue-router'

    import Uploader from "@C/uploader.vue"

    import { pageEditor } from "../"

    const r16_9 = 1.78
    let ratios = [
        { label:"16:9", value: r16_9 },
        { label:"16:10", value: 1.6 },
        { label:"4:3", value: 1.33 },
        { label:"1:1", value: 1 }
    ]
    
    let { id, bean, loading , updateContent } = pageEditor(
        { ratio: r16_9, summary: "", path: null, highlight: '' }, 
        d=> JSON.parse(d), 
        { padding: false }
    )

    const filesize  = r=> H.filesize(r)
    const toDate    = d=>H.date.datetime(d)
    const data = computed(()=> bean.value.id ? { pid: id, id: bean.value.id }:{ pid: id })

    let uploadDone = ({ data:{ path, addOn, uid, id } }, { file:{ size, name }})=>{
        bean.value.path = path? path.replace("\\","/") : null
        bean.value.size = size
        bean.value.user = uid
        bean.value.addOn= Date.now()
        bean.value.file = name
        bean.value.id   = id

        M.ok(`⌈${name}⌋已上传`)
    }

    let toSave = () => updateContent(JSON.stringify(bean.value))
</script>