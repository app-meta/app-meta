<!---->
<template>
    <n-tabs type="line">
        <n-tab-pane name="edit" display-directive="show:lazy" tab="服务配置">
            <Editor v-if="inited" :bean="bean" :updater="updater" :creater="newQ" />
        </n-tab-pane>
        <n-tab-pane name="deploy" :disabled="!canDeploy" display-directive="show:lazy" tab="上传与部署">
            <Deploy :aid="aid" :pid="id"/>
        </n-tab-pane>
        <n-tab-pane name="dashboard" display-directive="show:lazy" tab="服务访问记录">
            <Dashboard :aid="aid" />
        </n-tab-pane>
    </n-tabs>
</template>

<script setup>
    import { ref } from 'vue'

    import { pageEditor } from "../"
    import Editor from "./editor.vue"
    import Dashboard from "./dashboard.vue"
    import Deploy from "./deploy.vue"

    import { INSIDE } from "."

    const newQ = ()=>({title:'', type:0, required:false})

    let { id, aid, bean, inited, updateContent } = pageEditor(
        { mode:INSIDE, language:"node" },
        d=> JSON.parse(d),
        false
    )

    let canDeploy = ref(bean.value.mode==INSIDE)

    const updater = (terminal, onDone)=>{
        updateContent(JSON.stringify(terminal), ()=>{
            canDeploy.value = terminal.mode == INSIDE
            typeof(onDone) === 'function' && onDone()
        })
    }
</script>
