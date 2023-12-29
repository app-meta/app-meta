<template>
    <n-form :show-feedback="true" :label-width="80" label-placement="top">
        <n-grid x-gap="20" :cols="4">
            <n-form-item-gi label="函数类型">
                <n-select :options="funcModes" v-model:value="bean.mode"></n-select>
            </n-form-item-gi>
            <n-form-item-gi label="数据源">
                <n-select :options="sources" placeholder="不选则使用默认数据源" v-model:value="bean.sourceId"></n-select>
            </n-form-item-gi>
            <n-form-item-gi>
                <template #label>
                    <n-tooltip>
                        <template #trigger><span>返回结果格式 <i class="fa fa-question-circle" /></span></template>
                        纯SQL函数返回值统一为 List：
                        <div><Tag>对象</Tag> 元素为键值对</div>
                        <div><Tag>数组</Tag> 元素为一维数组</div>
                    </n-tooltip>
                </template>
                <n-radio-group v-model:value="bean.resultType" :disabled="bean.mode!='sql'">
                    <n-radio v-for="item in resultTypes" :value="item.value">{{item.label}}</n-radio>
                </n-radio-group>
            </n-form-item-gi>
        </n-grid>

        <n-form-item label="函数参数清单">
            <n-space vertical class="w-full">
                <n-table size="small" :bordered="false">
                    <thead>
                        <tr>
                            <th width="120">ID</th>
                            <th width="180">中文名称</th>
                            <th width="100">数据类型</th>
                            <th width="180">默认值</th>
                            <th width="80">必填</th>
                            <th>
                                校验正则表达式
                                <n-text depth="3" class="ml-1 text-xs">
                                    参数值需满足给定表达式
                                </n-text>
                            </th>
                            <th width="25">
                                <n-button circle size="tiny" secondary type="primary" @click="bean.params.push({})"><template #icon><n-icon :component="Plus" /></template> </n-button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in bean.params">
                            <td><n-input v-model:value="item.id"/> </td>
                            <td><n-input v-model:value="item.name"/> </td>
                            <td><n-select :options="paramsTypes" v-model:value="item.type" /> </td>
                            <td><n-input v-model:value="item.value"/> </td>
                            <td><n-switch v-model:value="item.required"/> </td>
                            <td><n-input v-model:value="item.regex"/> </td>
                            <td class="text-center">
                                <n-button circle size="tiny" @click="bean.params.splice(index,1)" tertiary type="error"><template #icon><n-icon :component="Trash" /></template> </n-button>
                            </td>
                        </tr>
                    </tbody>
                </n-table>

                <n-space>
                    <div title="勾选后，将会忽略不在上述范围的参数（按 ID 匹配）">强制参数模式 <i class="fa fa-question-circle" />：</div>
                    <n-switch v-model:value="bean.paramsLimit" />
                </n-space>
            </n-space>
        </n-form-item>

        <n-form-item>
            <template #label>
                函数代码
                <n-text depth="3" class="ml-2 text-sm">纯SQL时，支持使用 &#123&#123 变量名 &#125&#125，届时将替换成对应的参数值</n-text>
            </template>
            <!-- <n-input type="textarea" :rows="3" v-model:value="bean.cmd" /> -->
            <div class="w-full">
                <CodeEditor v-model:value="bean.cmd" ref="editor" language="sql" style="height: 200px;" />
            </div>
        </n-form-item>

        <n-form-item label="函数说明">
            <MDEditor ref="mdEditor" height="200px" :code="bean.summary" />
        </n-form-item>

        <n-space justify="space-between">
            <n-space>
                <n-button size="large" type="primary" @click="toHelp" secondary>帮助</n-button>
                <n-button size="large" type="primary" @click="toCall" :loading="loading" secondary title="使用当前参数测试接口，原始返回值请打开 F12 查看">测试函数</n-button>
            </n-space>
            <n-button size="large" @click="toSave" type="primary">保存函数信息</n-button>
        </n-space>
    </n-form>

    <n-drawer v-model:show="help" width="1040">
        <n-drawer-content title="FaaS函数说明" :closable="true" :body-content-style="{padding:'10px'}">
            <MDRender :code="About" />
        </n-drawer-content>
    </n-drawer>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { Plus, Trash } from "@vicons/fa"

    import CodeEditor from "@C/editor.code.vue"
    import MDEditor from "@C/markdown/md.editor.vue"
    import MDRender from "@C/markdown/md.viewer.vue"

    import { pageEditor } from "../"
    import About from "./说明.md"

    import { createFaas, funcModes, resultTypes, paramsTypes } from "."

    let { id, bean, inited, loading , updateContent } = pageEditor(createFaas, d=> JSON.parse(d), false)

    let sources = ref([])
    let mdEditor = ref()
    let help = ref(false)

    const toSave    = ()=> {
        bean.value.summary = mdEditor.value.getMarkdown()

        updateContent(JSON.stringify(bean.value))
    }
    const toCall    = ()=>{}
    const toHelp    = ()=> help.value = true

    onMounted(()=>{
        RESULT("/dbm/source/list",{}, d=> {
            let temps = d.data.map(v=>({value:v.id, label:v.name}))
            temps.push({ value:0, label:"[平台数据源]"})
            sources.value = temps
        })
    })
</script>
