<template>
    <n-card title="基本配置" size="small">
        <n-form label-placement="top":show-feedback="false">
            <n-grid :x-gap="12" cols="6" responsive="screen">
                <n-form-item-gi label="列宽度">
                    <n-input-number :bordered="true" class="w-full" v-model:value="bean.width" min="100" step="10">
                        <template #suffix> <Tag>px</Tag></template>
                    </n-input-number>
                </n-form-item-gi>

                <n-form-item-gi label="按钮尺寸">
                    <n-select :options="sizeOpts" v-model:value="bean.size" />
                </n-form-item-gi>

                <n-form-item-gi label="按钮样式">
                    <n-select :options="typeOpts" v-model:value="bean.type" />
                </n-form-item-gi>
            </n-grid>
        </n-form>
    </n-card>

    <n-table class="mt-3" size="small" :bordered="false">
        <thead>
            <tr>
                <th width="40" class="text-center">#</th>
                <th width="90">类型</th>
                <th>按钮文本</th>
                <th width="180">样式</th>
                <th width="60">图标</th>
                <th width="80" class="text-center">
                    <n-button circle size="tiny" secondary type="primary" @click="add"><template #icon><n-icon :component="Plus" /></template> </n-button>
                </th>
            </tr>
        </thead>
        <tbody ref="dragEl">
            <tr v-for="(item, index) in bean.buttons">
                <td class="text-center"> <i class="draggable fa fa-list"></i> </td>
                <td><n-select :options="categroies" v-model:value="item.category" /> </td>
                <td><n-input v-model:value="item.label"/> </td>
                <td><n-select :options="types" v-model:value="item.type" /></td>
                <td>
                    <n-popover trigger="click">
                        <template #trigger>
                            <n-button :type="item.type" secondary block>
                                <template #icon><component :is='icons[item.icon]' /></template>
                            </n-button>
                        </template>
                        <n-grid cols="5" x-gap="20" y-gap="20" class="p-3">
                            <n-gi v-for="(icon, iconName) in icons" :title="iconName">
                                <component @click="item.icon=item.icon==iconName?null:iconName" class="cursor-pointer icon text-lg" :class="{'primary': iconName==item.icon}" :is='icon' />
                            </n-gi>
                        </n-grid>
                    </n-popover>
                </td>
                <td class="text-center">
                    <n-button circle title="编辑脚本" :disabled="item.category=='view'" size="tiny" @click="editBtnScript(item)" tertiary type="primary"><template #icon><n-icon :component="Code" /></template> </n-button>
                    <n-button class="ml-2" circle size="tiny" @click="bean.buttons.splice(index,1)" tertiary type="error"><template #icon><n-icon :component="Trash" /></template> </n-button>
                </td>
            </tr>
        </tbody>
    </n-table>

    <n-modal v-model:show="btner.show" preset="card" :style="{width: '1000px'}" :mask-closable="true">
        <template #header>
            按钮⌈{{btner.item.label}}⌋的脚本代码
        </template>
        <n-alert type="info" class="mb-4" :bordered="false" >
            点击按钮后出发，如果是<Tag size="small">数据行</Tag>按钮，参数为：btn（按钮对象）、row（行数据）、rowIndex（行序号）
        </n-alert>

        <CodeEditor v-model:value="btner.item.handler" height="420px" />
    </n-modal>
</template>

<script setup>
    import { ref, reactive, onMounted, nextTick } from 'vue'
    import { Plus,Trash, Code } from '@vicons/fa'
    import { useDraggable } from 'vue-draggable-plus'

    import CodeEditor from "@code.editor"

    import { icons } from "."
    const categroies = [{value:"", label:"通用"}, {value:"del", label:"删除"}, {value:"view", label:"详细"}]
    const types = UI.buildOptions({default:"默认/DEFAULT", primary:"主要/PRIMARY", info:"信息/INFO", success:"成功/SUCCESS", warning:"警告/WARN", error:"错误/ERROR"})
    const sizeOpts = [{ value:"large", label:"大" }, { value:"medium", label:"中" }, { value:"small", label:"小" }, { value:"tiny", label:"迷你" }]
    const typeOpts = [{ value:"", label:"默认" }, { value:"secondary", label:"次要" }, { value:"tertiary", label:"次次要"}, { value:"quaternary", label:"纯文本"} ]

    const props=defineProps({
        bean:{type:Object}
    })
    let dragEl = ref()
    const btner  = reactive({show: false, item:{}})

    const add = ()=> props.bean.buttons.push({id:"", label:`新建按钮`, category:""})
    const editBtnScript = v=> {
        btner.item = v
        btner.show = true
    }

    onMounted(()=>nextTick(()=>useDraggable(dragEl, props.bean.buttons, {handle:".draggable"})))
</script>
