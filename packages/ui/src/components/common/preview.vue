<!--
    文档预览
        docx    2023-04-13
        图片类  2023-04-13


    docx 使用 docxjs 进行渲染，配置参数
        const options = {
            className: 'docx', // 默认和文档样式类的类名/前缀
            inWrapper: true, //  启用围绕文档内容渲染包装器
            ignoreWidth: false, //  禁止页面渲染宽度
            ignoreHeight: false, //  禁止页面渲染高度
            ignoreFonts: false, //  禁止字体渲染
            breakPages: true, //  在分页符上启用分页
            ignoreLastRenderedPageBreak: true, //  禁用lastRenderedPageBreak元素的分页
            experimental: false, //  启用实验性功能（制表符停止计算）
            trimXmlDeclaration: true, //   如果为真，xml声明将在解析之前从xml文档中删除
            debug: false, //  启用额外的日志记录
            useBase64URL: true, // 如果为true，图片、字体等将被转换为base 64 URL，否则使用URL.createObjectURL
            useMathMLPolyfill: false, //  包括用于 chrome、edge 等的 MathML polyfill。
            showChanges: false // 启用文档更改（插入/删除）的实验性呈现
        }
-->
<template>
    <NDrawer v-model:show="show" :default-width="width" :close-on-esc="false" :mask-closable="false" resizable class="PREVIEW">
        <NDrawerContent :native-scrollbar="false" closable :body-content-style="{padding:'0px'}">
            <template #header>
                <NTag type="primary" :bordered="false">文档预览</NTag> {{title}}
            </template>

            <div v-if="ext=='JPG' || ext=='JPEG' || ext=='PNG'" class="p-3">
                <img style="display:block; max-width:100%; margin:0px auto" :src="dataUrl" />
            </div>
            <div v-else-if="ext=='DOCX'" ref="container" class="preview"></div>
            <iframe v-else-if="ext=='PDF'" :src="dataUrl" frameborder="0"  type="application/x-google-chrome-pdf" class="w-full" style="height: calc(100vh - 52px);"></iframe>
            <div v-else class="text-center">
                未实现 {{ext}} 类型文档的预览
            </div>
        </NDrawerContent>
    </NDrawer>
</template>

<script setup>
    import { ref, nextTick, onMounted } from 'vue'
    /**
     * 考虑到需要此为函数式组件，故需要引入组件，否则报错 Failed to resolve component
     */
    import { NTag, NDrawer, NDrawerContent } from "naive-ui"

    import { renderAsync } from "docx-preview"

    const limitExts = ["DOCX", "JPG", "PDF", "PNG", "JPEG"]

    const props = defineProps({
        width: {type:[String, Number], default:"60%"},
        tip: {type:Boolean, default: false},
        bean: {type:Object, default:undefined}
    })

    let loading = ref(false)
    let container = ref()
    let ext = ref()
    let dataUrl = ref("")
    let show = ref(false)
    let title = ref("")

    const open = row=>{
        if(!limitExts.includes(row.ext))    return M.notice.warn(`目前仅支持 ⌈${limitExts.join("、")}⌋ 等类型文档的预览，请下载后查看`, `暂不支持该类文档的预览`)

        let max = Config.doc_preview_max || 2
        if(row.size >  max * 1024 * 1024)
            return M.notice.warn(`该附件超过 ${max} MB，无法在线预览，请下载后查看`)

        ext.value = row.ext
        title.value = row.filename || ""
        show.value = true

        nextTick(()=>{
            loading.value = true
            DOWNLOAD(
                "/page/document-download",
                { id: row.id, pid:row.pid, aid:"preview" },
                {
                    handler: blob=>{
                        if(props.tip)   M.info(`预览附件⌈${title.value}⌋`)

                        if(["PNG","JPG","JPEG"].includes(ext.value)){
                            dataUrl.value = URL.createObjectURL(new Blob([blob], { type: "image/jpg" }))
                        }
                        else if(ext.value == 'DOCX'){
                            renderAsync(blob,  container.value).then(x=> console.debug("docx ok", x))
                        }
                        else if(ext.value == "PDF"){
                            dataUrl.value = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }))
                        }
                        loading.value = false
                    },
                    onFail: ()=> loading.value = false
                }
            )
        })
    }

    onMounted(() => {
        if(props.bean && props.bean.id && props.bean.pid)
            open(props.bean)
    })

    defineExpose({ open })
</script>

<style lang="less" scoped>
    .preview:deep(.docx-wrapper) {
        background-color: #e9e9e94a !important;
        padding: 20px;
    }

    .preview:deep(.docx-wrapper > section.docx) {
        width: 100% !important;
        padding: 1rem !important;
        min-height: auto !important;
        box-shadow: none;
        margin-bottom: 0;
    }
</style>
