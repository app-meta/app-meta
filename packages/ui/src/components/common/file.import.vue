<!--
    该工具帮助用户从文件（如 Excel、TXT、CSV 等）导入数据，并转换为文本（JSON）格式
    可用于快速批量导入数据（如批量用户ID）
-->
<template>
    <n-drawer v-model:show="active" :width="width">
        <n-drawer-content :title="title" :closable="true">
            <n-alert :bordered="false" type="info" title="说明">
                <slot name="tip">该工具帮助用户从文件（如 Excel、TXT、CSV 等）导入数据，并转换为 JSON 格式的文本</slot>
            </n-alert>

            <n-form :show-feedback="false" :label-width="80" label-placement="top">
                <n-space vertical>
                    <FileSelector class="mt-2" :accept="accept" placeholder="请选择数据文件（XLSX、TXT、CSV）" @update:value="onSelect" />
                    <n-grid x-gap="10" :cols="4">
                        <n-form-item-gi>
                            <template #label>
                                <n-tooltip>
                                    <template #trigger>SHEET序号</template>
                                    默认为0（即第一个 Sheet），如果想要导入全部请输入 -1
                                </n-tooltip>
                            </template>
                            <n-input-number class="w-full" :disabled="lockSheet || ext!='XLSX'" :min="-1" v-model:value="opt.sheet" />
                        </n-form-item-gi>

                        <n-form-item-gi>
                            <template #label>
                                <n-tooltip>
                                    <template #trigger>列序号</template>
                                    默认为 -1（即全部读取），若设置为大于等于 0（第一列，序号从 0 开始） 的值则只取对应的列数据
                                </n-tooltip>
                            </template>
                            <n-input-number class="w-full" :disabled="ext ==='TXT'" :min="-1" v-model:value="opt.col" />
                        </n-form-item-gi>

                        <n-form-item-gi label="数据格式">
                            <!-- <template #label>
                                <n-tooltip>
                                    <template #trigger>数据格式</template>
                                    <div><n-tag type="primary" :bordered="false" size="small" class="mr-2">JSON</n-tag></div>
                                    <div><n-tag type="primary" :bordered="false" size="small" class="mr-2">二维数组</n-tag></div>
                                </n-tooltip>
                            </template> -->
                            <n-select v-model:value="opt.type" :options="dataTypes" />
                        </n-form-item-gi>
                        <n-form-item-gi>
                            <template #label>
                                <n-tooltip>
                                    <template #trigger>格式化数据</template>
                                    打勾后系统将自动进行格式化（方便阅读）
                                </n-tooltip>
                            </template>
                            <n-switch :disabled="!preview || ext ==='TXT'" v-model:value="opt.format" />
                        </n-form-item-gi>
                    </n-grid>
                    <!-- <n-form-item label="单行数据处理函数">
                        <div class="w-full"><CodeEditor v-model:value="parser.line" height="240px" /></div>
                    </n-form-item> -->
                </n-space>
            </n-form>
            <template #footer>
                <n-button type="primary" secondary @click="doWork">{{processBtnText}}</n-button>
            </template>
        </n-drawer-content>
    </n-drawer>

    <n-drawer v-model:show="showData" :width="640" :mask-closable="false" :close-on-esc="false">
        <n-drawer-content title="数据预览" :body-content-style="{padding:0}" :native-scrollbar="false" :closable="true">
            <!-- <n-code :code="code" language="javascript" show-line-numbers /> -->
            <CodeEditor v-model:value="text" height="100%" :tabSize="2" />
            <template #footer>
                <n-button type="primary" @click="emits('update', text, ext, file.name)">{{okBtnText}}</n-button>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<script setup>
    import { ref, reactive } from 'vue'

    import CodeEditor from "@code.editor"
    import FileSelector from '@grid-form/render-naive/widgets/FileSelector.vue'

    const emits = defineEmits(["update"])
    const props = defineProps({
        title:{type:String, default:"数据文件导入工具"},
        accept:{type:String, default:".xlsx,.txt,.csv"},
        lockSheet:{type:Boolean, default:false},
        processBtnText:{type:String, default:"开始处理"},
        preview:{type:Boolean, default:true},           //是否预览数据（此时会转换为 文本）
        okBtnText:{type:String, default:"已阅，执行导入"},
        width:{type:[Number, String], default:920},     //抽屉弹出宽度
        pretty:{type:Boolean, default:false},           //是否转换为已排版的 JSON 格式
        tabSize:{type:Number, default:2},               //转换为美化 JSON 格式的制表符长度（空格数量）
        col:{type:Number, default:-1}
    })

    let active      = ref(false)
    let showData    = ref(false)
    let ext         = ref("")

    const opt       = reactive({sheet:0, format:true, col: props.col, type:"JSON"})
    let dataTypes   = UI.buildOptions("JSON,ARRAY|二维数组")

    const parser    = reactive({line:""})
    let text        = ref("")
    let file        = {}

    const open = ()=>{
        active.value = true
    }
    const close = ()=>{
        text.value      = ""
        showData.value  = false
        active.value    = false
    }
    const onSelect = f=>{
        file = f
        // isExcel.value = file.type.indexOf(".sheet") > 0
        ext.value = file.name.toUpperCase().split(".").pop()
    }

    const _onData = d=>{
        if(props.preview){
            text.value  = typeof(d)==='string'? d : (opt.format? JSON.stringify(_transfer(d), null, props.tabSize): JSON.stringify(_transfer(d)))
            showData.value  = true
        }
        else{
            emits('update', d, ext.value, file.name)
        }
    }
    /**
     * 参数 d 为数组（元素可以是 Array、Object，分别对应数据格式 二维数组、JSON）
     */
    const _transferWithRows = d=>{
        let idx = typeof(d[0])=='object'? Object.keys(d[0])[opt.col] : opt.col
        return d.map(v=> v[idx])
    }
    const _transfer = d=>{
        if(opt.col >= 0){
            /*
            指定列时
            如果是单个 sheet 返回： ["列A-1", "列A-2"]
            多个 sheet 返回： [
                { name:"sheet1", rows: ["列A-1", "列A-2"] },
                { name:"sheet2", rows: ["列A-1", "列A-2"] }
            ]
            */
            if(ext.value === 'XLSX'){
                return opt.sheet >= 0? _transferWithRows(d) : d.map(sheet=>({name:sheet.name, rows:_transferWithRows(sheet.rows)}))
            }
            else if(ext.value === 'CSV')
                return _transferWithRows(d)
        }
        return d
    }
    const doWork = ()=>{
        let useArray = opt.type === 'ARRAY'

        if(ext.value==='XLSX'){
            H.excel.readToJSON(file, opt.sheet, {header:useArray?1:undefined}).then(_onData)
        }
        else if(ext.value === 'TXT'){
            H.io.read(file).then(_onData)
        }
        else if(ext.value === 'CSV'){
            H.io.readCSV(file, !useArray, ",").then(_onData)
        }
        else
            M.warn(`请选择xlsx、txt、csv格式的文件`)
    }

    defineExpose({ open, close })
</script>
