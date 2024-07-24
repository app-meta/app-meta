<!--
权限选择器

U开头：用户限定
D开头：部门限定
R开头：平台角色限定
A开头：应用角色限定，格式 A{应用ID}@{角色ID}，示例 Ademo@admin 为 demo 应用下的 admin 角色
-->
<template>
    <slot>
        <n-tooltip trigger="hover">
            <template #trigger>
                <n-button circle type="primary" secondary :size="size" @click="open()">
                    <template #icon> <n-icon :component="ShieldAlt" /></template>
                </n-button>
            </template>
            <template v-if="tooltip">当前授权码：{{value}}</template>
            <template v-else>点击编辑授权信息</template>
        </n-tooltip>
    </slot>

    <n-modal v-model:show="show" preset="card" :style="{width: '1000px'}" :mask-closable="false">
        <template #header>
            <n-tag :bordered="false" type="primary">
                <ShieldAlt class="icon"/>
                权限分配
            </n-tag>
            {{title}}
        </template>

        <n-alert :bordered="false" type="info" title="规则说明">
        </n-alert>

        <n-form class="mt-2" :show-feedback="false" :label-width="120" label-placement="left">
            <n-space vertical size="large">
                <n-form-item label="按用户授权">
                    <n-space vertical class="w-full">
                        <n-select :disabled="popular" v-model:value="users" :options="userOpts" multiple filterable clearable placeholder="选择用户"/>
                        <n-space justify="space-between">
                            <n-text depth="3">检测时优先以 <n-tag size="small" :bordered="false">用户授权</n-tag> 进行判断</n-text>
                            <n-button type="info" secondary size="small" @click="importor.open">从 TXT 和 EXCEL 导入</n-button>
                        </n-space>
                    </n-space>
                </n-form-item>
                <n-form-item label="按部门授权">
                    <n-select :disabled="popular" v-model:value="departs" :options="depOpts" multiple filterable clearable placeholder="选择部门"/>
                </n-form-item>
                <n-form-item label="按平台角色授权">
                    <n-select :disabled="popular" v-model:value="roles" :options="roleOpts" multiple filterable clearable placeholder="选择平台角色" :render-option="renderRole"/>
                </n-form-item>
                <n-form-item v-if="!!aid" label="按应用角色授权">
                    <n-select :disabled="popular" v-model:value="appRoles" :options="appRoleOpts" multiple filterable clearable placeholder="选择应用角色" :render-option="renderRole"/>
                </n-form-item>
                <n-form-item label="完全不限制">
                    <n-switch v-model:value="popular"></n-switch>
                    <n-text depth="3" class="ml-3">勾选后，对全部人员可见/可用</n-text>
                </n-form-item>
            </n-space>

            <div class="text-center mt-4">
                <n-button type="primary" size="large" secondary @click="onOk"><template #icon><n-icon :component="Check" /></template>确认</n-button>
            </div>
        </n-form>
    </n-modal>

    <FileImportor ref="importor" @update="onData" accept=".xlsx,.txt" title="批量用户ID导入（TXT、XLXS格式）" :col="0">
        <template #tip>
            <div><n-tag type="primary" :bordered="false" size="small" class="mr-2">TXT（纯文本）</n-tag>一行一个用户ID（空行将被删除）</div>
            <div class="mt-1"><n-tag type="primary" :bordered="false" size="small" class="mr-2">表格（EXCEL）</n-tag>默认第一行为标题，数据从第二行开始（只取第一列）</div>
            <div class="mt-1"><n-tag type="primary" :bordered="false" size="small" class="mr-2">CSV（纯文本）</n-tag>同 EXCEL</div>
        </template>
    </FileImportor>
    <!-- n-modal v-model:show="show" -->
</template>

<script setup>
    import { ref, onMounted, h } from 'vue'
    import { NTooltip } from 'naive-ui'
    import { ShieldAlt, Check } from "@vicons/fa"

    import FileImportor from "@CC/file.import.vue"

    const emits = defineEmits(["update:value", "ok"])
    const props = defineProps({
        aid     :{type:String},                     //应用ID，默认为空则不支持选择应用角色
        size    :{type:String, default:"small"},    //medium
        value   :{type:String, default:null},
        split   :{type:String, default:","},
        link    :{type:String, default:""},
        all     :{type:String, default:"**"},
        url     :{type:String, default:"/account/all"},
        dataObj :{type:Object},
        tooltip :{type:Boolean, default: true}
    })

    const U     = "U"
    const D     = "D"
    const R     = "R"
    const A     = "A"
    const len   = props.link.length + 1

    let title   = ref("")
    let show    = ref(false)
    let users   = ref([])
    let departs = ref([])
    let roles   = ref([])
    let appRoles= ref([])
    let popular = ref(props.value === props.all)
    let userOpts= ref([]) //UI.buildOptions("0001|张三,0002|李四,0003|王五,0004|赵六,0005|曾七,0006|陈八,0007|莫十")
    let depOpts = ref([]) //UI.buildOptions("01|办公室,02|计划财务部,03|销售部,04|科技部,05|人力资源部")
    let roleOpts= ref([])
    let appRoleOpts = ref([])

    let importor= ref()

    const _parseData = d=>{
        let { accounts, departments, roles } = d

        userOpts.value = accounts.map(v=>({label:`${v.name}(${v.id})`, value:v.id}))
        depOpts.value = departments.map(v=>({label:v.name, value:v.id}))
        roleOpts.value = roles.map(v=>({label:v.name, value:v.id, summary:v.summary}))

        //加载应用角色
        if(props.aid){
            RESULT("/app/role/list", { aid:props.aid }, dd=> {
                appRoleOpts.value = dd.data.map(v=>({label:`${v.uuid} | ${v.name}`, value:`${v.aid}@${v.uuid}`, summary: v.summary}))
            })
        }
    }

    const renderRole = ({ node, option })=> h(NTooltip, null, {
        trigger: () => node,
        default: () => option.summary
    })

    const open = (_title="")=>{
        if(userOpts.value.length <= 0 && props.url){
            RESULT(props.url, {}, d=> _parseData(d.data))
        }
        if(typeof(props.value)==='string'){
            popular.value = props.value === props.all

            let items = props.value.split(props.split).map(v=>v.trim())
            users.value = items.filter(v=>v.startsWith(`${U}${props.link}`)).map(v=>v.substring(len))
            departs.value = items.filter(v=>v.startsWith(`${D}${props.link}`)).map(v=>v.substring(len))
            roles.value = items.filter(v=>v.startsWith(`${R}${props.link}`)).map(v=>v.substring(len))
            appRoles.value = items.filter(v=>v.startsWith(`${A}${props.link}`)).map(v=>v.substring(len))
        }
        title.value = _title
        show.value = true
    }

    const _map = (list, split)=> list.map(v=>`${split}${props.link}${v}`)

    const onOk = ()=>{
        let v = popular.value===true ?
            props.all
            :
            [..._map(users.value, U), ..._map(departs.value, D), ..._map(roles.value, R), ..._map(appRoles.value, A)].join(props.split)
        emits("update:value", v)
        emits("ok", v)

        show.value = false
    }

    const onData = (text, ext)=>{
        let ids = (ext === "TXT"?text.split("\n"):JSON.parse(text)).filter(v=>!!v).map(v=>v.trim())
        users.value = ids
        M.ok(`从文件中导入${ids.length}个用户信息`)
        importor.value.close()
    }

    onMounted(() => {
        if(props.dataObj)
            _parseData(props.dataObj)
    })

    defineExpose({ open })
</script>
