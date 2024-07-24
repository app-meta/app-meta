<template>
    <div style="width:80%;margin:0px auto;">
        <n-alert title="前端资源更新" type="info" :bordered="false">
            <div>1、只允许上传当天新鲜热辣打包的 <n-text code>{{name}}</n-text> （无需做任何修改） </div>
            <div>2、上传成功后，自动进行解压操作（覆盖全部旧文件），故请 <n-text code>慎重操作</n-text> </div>
        </n-alert>

        <Uploader class="mt-3" accept=".zip" action="/app/version/upload" @ok="onOk" :noticeOnOk="false">
            <n-upload-dragger>
                <div>
                    <n-icon size="48" :depth="3" :component="Upload" />
                </div>
                <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传 </n-text>
            </n-upload-dragger>
        </Uploader>

        <n-card title="执行结果" class="mt-3" size="small">
            <div v-html="lines" style="height:340px; overflow:auto; font-size:12px"></div>
        </n-card>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { Upload } from "@vicons/fa"

    import Uploader from "@C/uploader.vue"

    const name = "www.zip"
    const lines = ref([])

    let onOk = d=>{
        lines.value = d.data
        M.ok(`资源文件导入成功`)
    }
</script>
