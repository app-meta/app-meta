<template>
    <n-layout class="window-h-full">
        <n-layout-header :style="{height: headerHeight+'px', padding: '5px'}" bordered>
            <n-space justify="space-between">
                <div style="font-size: 24px;">统计图表设计器</div>

                <n-space>
                    <n-button type="primary" @click="toSave" :loading="loading"><template #icon><n-icon :component="CheckCircle" /></template> 保存表单</n-button>
                </n-space>
            </n-space>
        </n-layout-header>
        <n-layout position="absolute" :style="{top: headerHeight + 'px', bottom: '0px'}" has-sider>
            <n-layout  has-sider sider-placement="right">
                <n-layout :native-scrollbar="false" content-style="padding: 10px 20px 10px 20px;" class="chart-editor">
                    <n-grid :x-gap="gridGap" :y-gap="gridGap" :cols="colSpan" class="designer-content">
                        <n-gi v-for="(item, index) in bean" :span="item.col">
                            <n-card size="small" :title="item.title" @click="onActive(item, index)" @contextmenu="e=>showMenu(e, index)" class="cursor-pointer">
                                <!--使用右键菜单删除挂件-->
                                <!-- <template #header-extra>
                                    <n-popconfirm @positive-click="()=> bean.splice(index, 1)">
                                        <template #trigger>
                                            <n-button class="remove" secondary type="error" size="tiny" circle> <template #icon> <n-icon :component="Trash" /> </template> </n-button>
                                        </template>
                                        删除 <n-text code>{{item.title}}</n-text> 吗？
                                    </n-popconfirm>
                                </template> -->

                                <component :is='renderItem(item, true)' />
                            </n-card>
                        </n-gi>

                        <n-gi class="cell flex" style="align-items: center; justify-content: center;" span="1">
                            <n-popover ref="addPopover" placement="bottom" trigger="click" width="160">
                                <template #trigger>
                                    <n-button secondary type="primary" circle><template #icon><n-icon :component="Plus" /></template> </n-button>
                                </template>
                                <n-space vertical class="custom-btn-list" size="small">
                                    <template  v-for="item in itemTypes">
                                        <n-button secondary @click="onSelect(item)" :type="item.theme" block>
                                            <template #icon><n-icon :component="item.icon" /></template>
                                            {{item.label}}
                                        </n-button>
                                    </template>
                                </n-space>
                            </n-popover>
                        </n-gi>
                    </n-grid>
                </n-layout>

                <n-layout-sider collapse-mode="transform" :collapsed-width="10" show-trigger="arrow-circle" content-style="padding: 12px;" :native-scrollbar="false" :width="siderWidth" bordered>
                    <AttributeEditor :bean="attrEditor.bean" :items="attrEditor.items" :compact="true" />
                </n-layout-sider>
            </n-layout>
        </n-layout>
    </n-layout>

    <!--右键菜单-->
    <n-dropdown placement="bottom-start" trigger="manual" :x="menu.x" :y="menu.y" :options="menuOptions" :show="menu.show"
        :on-clickoutside="()=>menu.show=false" @select="onMenuSelect" />
</template>

<script setup>
    import { ref, onMounted, reactive } from 'vue'
    import { CheckCircle,Plus, Trash, HandPointRightRegular, HandPointLeftRegular, Copy } from '@vicons/fa'

    import AttributeEditor from "./edit-attribute.vue"

    import { colSpan, CONST, track } from "./"
    import { renderItem, itemAttrs, itemTypes,createItemMenuOpts } from "./widget"
    import { pageEditor } from "../"

    const gridGap           = 12
    const siderWidth        = 400
    const headerHeight      = 45

    const attrEditor = reactive({ bean:{}, items:[], index:-1 })
    const menu = reactive({x:0, y:0, show:false, index:-1})
    const menuOptions = [
        { label:"复制JSON", key:"copy", icon: UI.buildIcon2(Copy, {class:"info"}) },
        { type:"divider" },
        {  label:"在前插入",key:"before", icon:UI.buildIcon2(HandPointLeftRegular), children: createItemMenuOpts("before") },
        {  label:"在后追加",key:"after", icon:UI.buildIcon2(HandPointRightRegular), children: createItemMenuOpts("after") },
        { type:"divider" },
        { label:"删除", icon:UI.buildIcon2(Trash, {class:"error"}), key:"delete" }
    ]

    let addPopover = ref()
    let { id, bean, loading , updateContent } = pageEditor([], d=> JSON.parse(d))

    const toSave = () => updateContent(JSON.stringify(bean.value), ()=> M.notice.ok(`图表数据保存成功`))

    const onSelect = (item, position=-1)=>{
        let newItem = { title:item.label, col:2, widget:item.id, origin:CONST, data:"", height:300, debug:true }
        if(item.create) Object.assign(newItem, item.create())
        track("新增组件", newItem)
        if(position<=-1)
            bean.value.push(newItem)
        else
            bean.value.splice(position, 0, newItem)

        addPopover.value.setShow(false)
        M.info(`新增挂件⌈${newItem.title}⌋`)
        menu.index = -1
    }

    const onActive = (item, index)=>{
        if(menu.index == index)         return
        if(attrEditor.index == index)   return

        let items = itemAttrs[item.widget]
        if(!!items){
            attrEditor.bean     = item
            attrEditor.items    = items
            attrEditor.index    = index
        }
        else
            M.warning(`注册的组件中找不到⌈${item.widget}⌋，请联系管理员`)
    }

    const showMenu = (e, index)=>{
        e.preventDefault()
        menu.x = e.clientX
        menu.y = e.clientY
        menu.index  = index
        menu.show = true
    }
    const onMenuSelect = (key, opt)=>{
        if(key == 'delete'){
            let item = bean.value[menu.index]
            item && M.confirm(`删除挂件`, `确定删除⌈${item.title}⌋吗？`, ()=> {
                bean.value.splice(menu.index, 1)
                M.warn(`挂件⌈${item.title}⌋已移除`)
            })
        }
        else if(key == 'copy'){
            H.copyTo(bean.value[menu.index])
            M.ok(`挂件数据已复制到粘贴板`)
        }
        else {
            onSelect(opt, menu.index + (key.indexOf("before-")==0?0:1))
        }

        menu.show = false
    }
</script>

<style scoped lang="less">
    .chart-editor {
        .cell {
            min-height: 50px;
            padding: 8px;
            background: rgba(200, 200, 200, 0.1);
        }
    }
</style>
