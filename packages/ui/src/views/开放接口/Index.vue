<template>
    <n-layout style="height: 100%">
        <n-layout-header :style="{height: headerHeight+'px', padding: '0px'}" bordered>
            <n-space justify="space-between">
                <div>
                    <span class="text-lg">数据开放接口管理</span>
                    <n-text depth="3" class="ml-3 text-xs">
                        自由定义接口，方便第三方调用，请慎重使用
                    </n-text>
                </div>

                <n-space v-if="bean.id" :style="{lineHeight: headerHeight+'px'}">
                    <span>当前接口 #{{bean.id}}：</span>
                    <ClickInput :text="bean.name" size="small" :onUpdate="v=>toEdit(v)" />
                    <n-button circle size="tiny" @click="toDel" tertiary type="error"><template #icon><n-icon :component="Trash" /></template> </n-button>
                </n-space>
            </n-space>
        </n-layout-header>

        <n-layout position="absolute" :style="{top: headerHeight + 'px'}" has-sider>
            <n-layout  has-sider sider-placement="left">
                <!--文档目录（自动计算 TOC）-->
                <n-layout-sider collapse-mode="transform" :collapsed-width="collapsedWidth" show-trigger="arrow-circle" content-style="padding: 12px;" :native-scrollbar="false" :width="siderWidth" bordered>
                    <n-input-group size="small">
                        <n-input v-model:value="keyword" placeholder="通过名称过滤接口" />
                        <n-popover trigger="click" width="300px" :show="showAdd" @clickoutside="showAdd=false"	>
                            <template #trigger>
                                <n-button secondary @click="showAdd=true" type="primary">新增接口</n-button>
                            </template>
                            <n-input v-model:value="name" placeholder="接口名称（回车以确认）" @keyup="handleKeyUp"></n-input>
                            <n-text depth="3" class="text-xs">默认归属到当前选择的接口（无则为一级节点）</n-text>
                        </n-popover>
                    </n-input-group>
                    <n-tree class="mt-2" :show-irrelevant-nodes="false" :pattern="keyword" :data="tree" block-node :node-props="nodeProps" />
                </n-layout-sider>

                <n-layout :native-scrollbar="false" content-style="height:100%; padding:10px;">
                    <Detail :apiId="bean.id" />
                </n-layout>
            </n-layout>
        </n-layout>
    </n-layout>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { Plus, Trash } from "@vicons/fa"

    import Detail from "./detail.vue"
    import ClickInput from "@C/dbclick.input.vue"

    const siderWidth        = "360px"
    const headerHeight      = 30
    const collapsedWidth    = 15

    let keyword = ref("")
    let tree = ref([])
    let bean = ref({})

    let showAdd = ref(false)
    let name = ref("")

    const refresh = ()=> RESULT("/api/query", {}, d=>{
        tree.value = UI.buildTree(d.data, {suffix:v=>()=>v.launch})
    })

    const nodeProps = ({option})=>({
        onClick: ()=> bean.value = option.bean
    })

    const handleKeyUp = ({keyCode})=>{
        if(keyCode == 13){
            if(!name.value) return
            RESULT("/system/api/edit", {name:name.value, pid: bean.value?bean.value.id:null}, d=>{
                M.ok(`新建接口⌈${name.value}⌋`)
                showAdd.value = false
                name.value = ""

                refresh()
            })
        }
    }

    const toEdit = n=>{
        bean.value.name = n
        RESULT("/system/api/edit", bean.value, d=> M.notice.ok(`接口⌈${n}⌋更新成功`))
    }

    const toDel = ()=>M.confirm(`删除接口`, `确定删除接口⌈${bean.value.name}⌋吗？`, ()=>{
        RESULT("/system/api/delete", {id:bean.value.id}, d=> {
            M.ok(`删除成功`)
            bean.value = {}
            refresh()
        })
    })

    onMounted( refresh )
</script>
