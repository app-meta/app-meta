<template>
    <n-alert type="info" size="small" :bordered="false">
        仅显示非我创建而具备维护权限的页面
    </n-alert>

    <n-tabs type="line" :bar-width="18" @update:value="onSelect" v-model:value="tab">
        <n-tab name="*">不限</n-tab>
        <n-tab v-for="t in templates" :name="t.id">
            <n-icon :component="t.icon" :class="t.theme" class="mr-1" />
            {{t.text}}
            <n-badge v-if="hasCount(t.id)" dot type="success" :offset="[5, -8]"/>
        </n-tab>

        <template #suffix>
            <n-input placeholder="筛选标题" v-model:value="keyword" @keyup="({keyCode})=> keyCode==13 && filter()" />
        </template>
    </n-tabs>

    <n-data-table class="mt-2" :columns="columns" size="small" :loading="loading" :data="beans" striped :style="{height}" flex-height :bordered="true" />

    <DocumentManager ref="docRef"><span></span></DocumentManager>
</template>

<script setup>
    import { ref, h, onMounted,nextTick } from 'vue'
    import { NSwitch, NPopconfirm, NTooltip } from 'naive-ui'
    import { Edit, Eye,FileWord } from '@vicons/fa'
    import { useRouter } from 'vue-router'

    import { templates, findTemplate, modifyPage, pageManage } from "@F"
    import ClickInput from "@C/dbclick.input.vue"
    import Template from "../widget/page.template.vue"
    import DocumentManager from "@F/document-manage.vue"

    const height = "calc(100% - 90px)"
    const align = "center"
    const router = useRouter()

    const { toView, toEdit } = pageManage(router)

    let docRef  = ref()
    let loading = ref(false)
    let origins = []
    let beans   = ref([])
    let keyword = ref("")
    let tab     = ref("*")

    let columns = [
        { title:"序号", width:55, align, render:(row, i)=> h('span', {class:"cursor-pointer", title:"点击复制ID", onClick:()=> copyId(row) }, i+1)},
        {
            title:"标题", key:"name",
            render: row=> h(ClickInput, {
                text:row.name, special:true,
                onUpdate:v=>modifyPage(row, "name", v, `标题更改为：${v}`),
                title:`完整编号：${row.aid}/${row.id}`
            })
        },
        { title:"所属应用", key:"content", width: 200,ellipsis:true },
        {
            title:"类型", key:"template", width: 90, render:row=> h(Template, {bean: findTemplate(row.template)})
        },
        {
            title:"可访问", key:"active", width:70,
            render:row=>h(
                NSwitch,
                {
                    defaultValue: row.active,
                    "on-update:value": v=>modifyPage(row, 'active', v, `页面设置为⌈${v?"可见":"不可见"}⌋`),
                }
            )
        },
        {
            key:"search", width:70,
            title:()=>h( NTooltip,{},{ trigger:()=>h('div', {class:"cursor-pointer"}, "可检索"), default:()=>`仅当可访问、可检索均勾选才能被检索` } ),
            render:row=>h(
                NSwitch,
                {
                    defaultValue: row.search,
                    "on-update:value": v=>modifyPage(row, 'search', v, `页面设置为⌈${v?"":"不"}可检索⌋`),
                }
            )
        },
        { title:"热度", key:"launch", width: 60 },
        { title:"更新日期", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) },
        {
            width:120, align, title: "操作",
            render(row, rowIndex) {
                return [
                    UI.iconBtn(Eye, ()=> toView(row), {title:"浏览页面", disabled:row.template=='server'}),
                    UI.iconBtn(Edit, ()=> toEdit(row), {title:"编辑页面"}),
                    UI.iconBtn(FileWord, ()=> docRef.value.open(row.id, row.name), {title:"附件管理"})
                ]
            }
        }
    ]

    const hasCount  = id=> beans.value.find(v=>v.template == id)
    const onSelect  = ()=> nextTick(filter)
    const filter    = ()=> beans.value = origins.filter(v=>(tab.value == "*" || v.template==tab.value) && (keyword.value || v.name.indexOf(keyword.value))>=0)

    onMounted(() => RESULT("/page/list-editable",{}, d=> beans.value = origins = d.data))
</script>
