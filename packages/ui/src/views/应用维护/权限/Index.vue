<template>
    <n-alert :bordered="false" title="应用角色说明" show-icon type="info">
        <div>1、角色仅作用于应用内鉴权，如不配置角色，则默认不做拦截</div>
        <div>2、我要
            <n-button @click="toCheck" size="tiny" class="ml-1" secondary type="primary">查询用户关联</n-button>
            <n-button @click="toLink" size="tiny" class="ml-2" secondary type="primary">关联用户到角色</n-button>
        </div>
    </n-alert>

    <n-tabs type="line">
        <n-tab-pane name="role" tab="角色清单">
            <n-data-table :columns :loading :data :style="{height}"
                :bordered="false" striped size="small" flex-height />
        </n-tab-pane>
        <n-tab-pane name="link" tab="分配情况" display-directive="show:lazy">
            <LinkList :aid :height />
        </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="add.show" :style="{width:'640px'}" preset="dialog" :title="add.title">
        <n-form class="mt-2" label-width="120" label-placement="left">
            <n-form-item label="UUID" required>
                <n-input v-model:value="bean.uuid" :disabled="bean.id" />
            </n-form-item>
            <n-form-item label="角色名称" required>
                <n-input v-model:value="bean.name" />
            </n-form-item>
            <n-form-item label="授权信息">
                <n-input v-model:value="bean.auth" />
            </n-form-item>
            <n-form-item label="终端IP">
                <n-input v-model:value="bean.ip" placeholder="多个用英文逗号隔开，留空则为不限制"/>
            </n-form-item>
            <n-form-item label="说明">
                <n-input v-model:value="bean.summary" type="textarea" />
            </n-form-item>
        </n-form>

        <template #action>
            <n-button type="primary" :loading="add.loading" @click="editDo">确定</n-button>
        </template>
    </n-modal>

    <n-modal v-model:show="link.show" :style="{width:'640px'}" preset="dialog" title="分配角色（支持批量）">
        <n-form>
            <n-form-item label="用户ID">
                <n-input type="textarea" v-model:value="link.uid" placeholder="请填写ID，多个用英文逗号分开" />
            </n-form-item>
            <n-form-item label="分配角色">
                <n-select multiple :options="data" v-model:value="link.role" label-field="name" value-field="uuid" />
            </n-form-item>
        </n-form>
        <template #action>
            <n-button type="primary" :loading="loading" @click="linkDo">确定分配</n-button>
        </template>
    </n-modal>
</template>

<script setup>
    import { h, ref, onMounted, reactive } from 'vue'
    import { Search, Edit, Trash, Plus } from "@vicons/fa"
    import { useRoute, useRouter } from 'vue-router'
    import { NButtonGroup, NPopconfirm } from 'naive-ui'

    import Tag from "@C/custom/tag.vue"
    import LinkList from "./角色分配清单.vue"

    const route = useRoute()

    let aid = route.params.aid

    let height = "calc(100vh - 230px)"
    let loading = ref(false)
    let form = ref({LIKE_name:"", aid})
    let data = ref([])
    let add = reactive({show:false, title:"", update:false})
    let link = reactive({show:false, uid:"", role:[] })
    let bean = ref({})

    const columns = [
        { title:"序号", width:50, align:"center", render:(r,i)=> i+1 },
        { title:"UUID", width:90, key:"uuid", render:r=> h(Tag,{type:"default", size:"medium"}, ()=>r.uuid) },
        { title:"角色名称", width:180, key:'name' },
        { title:"授权", width:200, key:"auth", ellipsis:true },
        { title:"终端IP", width:200, key:"ip"},
        { title:"说明",key:"summary", ellipsis:true },
        { title:"更新日期", key:"addOn", width: 170, render: row=> row.addOn? H.date.datetime(row.addOn):"" },
        {
            width:100,align:"center",
            title:()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
            render:(row, rowIndex)=> h(NButtonGroup, ()=>[
                UI.iconBtn(Edit, ()=> toEdit(row), {title:"编辑角色",secondary:true}),
                h(
                    NPopconfirm,
                    {
                        onPositiveClick:()=> toDel(row.uuid, rowIndex),
                        "positive-button-props": {type:"error"}
                    },
                    {
                        default: ()=>`确定删除角色⌈${row.uuid}/${row.name}⌋吗？`,
                        trigger: ()=>UI.iconBtn(Trash, null, { secondary:true })
                    }
                ),
                // UI.iconBtn(Trash, ()=> toDel(roow), {title:"删除角色", secondary:true })
            ])
        }
    ]

    const refresh = ()=>RESULT("/app/role/list", {aid}, d=>data.value=d.data, {loading})

    const toEdit = row=>{
        console.debug(row)
        if(!!row && row.uuid){
            bean.value = row
            add.title = `编辑角色：${row.name}`
            add.update = true
        }
        else{
            bean.value = { aid, uuid:"", name:"" }
            add.title = `新增角色`
            add.update = false
        }
        add.show = true
    }
    const editDo = ()=>{
        let { uuid, name } = bean.value
        if(!uuid.trim() || !name.trim())  return M.warn(`UUID或者名称不能为空`)

        console.debug(bean.value)
        RESULT(
            `/app/role/${add.update?"update":"add"}`,
            bean.value,
            d=>{
                M.notice.ok(`角色⌈${uuid}/${name}⌋保存成功`)
                add.show = false
                refresh()
            },
            { loading }
        )
    }
    const toDel = (uuid, i) => RESULT("/app/role/delete", {aid, uuid},()=> {
        M.ok(`角色已删除`)
        data.value.splice(i, 1)
    })

    const toLink = ()=>{
        link.role = []
        link.show = true
    }
    const toCheck = ()=> M.prompt(`用户分配角色查询`, {placeholder:"请输入用户ID"}).then(uid=>{
        RESULT("/app/role/list", {aid, uid}, d=>{
            if(!d.data) return M.info(`用户${UI.wrap(uid)}未分配角色`)
            let roles = d.data.role.split(",").map(k=> {
                let r = data.value.find(v=>v.uuid==k)
                return r?`${r.uuid}/${r.name}`:k
            })
            M.alert(roles, `用户${UI.wrap(uid)}分配以下角色`)
        })
    })

    const linkDo = ()=>{
        if(!link.uid.trim())    return M.warn(`请填写用户ID`)

        RESULT("/app/role/link", {aid, uid:link.uid, role: link.role.join(',')}, d=>{
            M.notice.ok(`角色分配成功`)
            link.show = false
        })
    }

    onMounted( refresh )
</script>
