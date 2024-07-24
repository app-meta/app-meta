<template>
    <n-alert title="关于会员终端" type="info" :bordered="false">
        <n-tag :bordered="false" size="small" type="primary">会员终端</n-tag> 是指能够快速登录（指定用户ID）本平台的授权终端，详细说明
        <n-popover placement="bottom">
            <template #trigger><n-text code class="cursor-pointer">点此查看</n-text></template>
            <div>1、在终端构建参数：{UID}-{13位时间戳}</div>
            <div>2、使用密钥加密（方式为 AES/CBC/NoPadding，补全到16倍数）</div>
            <div>3、对密文进行 BASE64 编码后，以 text 参数名发送到后端（/outreach/create-key）</div>
            <div>4、拿到用户 TOKEN</div>
        </n-popover>
    </n-alert>

    <n-space class="mt-2">
        <n-input v-model:value="form.LIKE_id" placeholder="IP地址" clearable />
        <n-button secondary circle type="success" @click="refresh">
            <template #icon><n-icon :component="Search" /> </template>
        </n-button>
    </n-space>

    <n-data-table class="mt-2" :columns="columns" :loading="loading" :data="beans" :style="{height}" :remote="true" :bordered="false" striped size="small" flex-height />

    <n-drawer v-model:show="showEdit" :width="640" :mask-closable="false" :close-on-esc="false">
        <n-drawer-content :title="(isNew?'新建':'编辑')+`会员终端`" :native-scrollbar="false" :closable="true">
            <n-form :show-feedback="false" :label-width="80" label-placement="top">
                <n-space vertical size="large">
                    <n-form-item label="IP地址">
                        <n-input v-model:value="bean.id" :disabled="!isNew" />
                    </n-form-item>
                    <n-form-item label="终端代号/识别编码">
                        <n-input v-model:value="bean.uuid" :allow-input="uuidFilter" placeholder="数字/字母/下划线，建议唯一" />
                    </n-form-item>
                    <n-form-item label="终端名称">
                        <n-input v-model:value="bean.name" />
                    </n-form-item>
                    <n-form-item label="终端类型">
                        <n-radio-group v-model:value="bean.category">
                            <n-radio-button v-for="c in categories" :value="c.value"> {{ c.name }} </n-radio-button>
                        </n-radio-group>
                    </n-form-item>
                    <n-form-item label="允许登录的用户ID">
                        <n-input v-model:value="bean.ids" placeholder="多个用英文逗号隔开" />
                    </n-form-item>
                    <n-form-item label="AES 密钥">
                        <n-input v-model:value="bean.secret">
                            <template #suffix>
                                <n-space>
                                    <n-button size="tiny" type="info" secondary @click="copyKey">复制</n-button>
                                    <n-button size="tiny" type="primary" secondary @click="createKey">随机生成</n-button>
                                </n-space>
                            </template>
                        </n-input>
                    </n-form-item>
                    <n-form-item label="RSA 密钥">
                        <n-space vertical size="small" class="w-full">
                            <n-input v-model:value="bean.pubKey" size="small" type="textarea" placeholder="公钥/Public Key" rows="2">
                                <template #suffix>
                                    <n-button size="tiny" type="primary" secondary @click="createRsaKey">随机生成</n-button>
                                </template>
                            </n-input>
                            <n-input v-model:value="bean.priKey" size="small" type="textarea" placeholder="私钥/Private Key" />
                        </n-space>
                    </n-form-item>
                    <n-form-item label="TOKEN 有限期">
                        <n-radio-group v-model:value="bean.expire">
                            <n-space>
                                <n-radio v-for="item in expires" :value="item.value" :label="item.label" />
                            </n-space>
                        </n-radio-group>
                    </n-form-item>
                    <n-form-item label="备注信息">
                        <n-input v-model:value="bean.summary" type="textarea" rows="2" />
                    </n-form-item>
                </n-space>
            </n-form>
            <template #footer>
                <n-button type="primary" @click="toSave">保存终端信息</n-button>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<script setup>
    import { ref, onMounted, h,reactive } from 'vue'
    import { NTooltip, NTag, NSpace, NPopconfirm } from 'naive-ui'
    import { Plus, SyncAlt, Search, Trash, Edit } from '@vicons/fa'

    const expires = [{label:"3分钟",value:3},{label:"10分钟",value:10},{label:"30分钟",value:30},{label:"2小时",value:120},{label:"24小时",value:1440}]
    const categories = [{name:"命令行/CLI",value:"cli"}, {name:"工作者/WORKER", value:"worker"}, {name:"其他", value:"other"}]

    let form = reactive({LIKE_id:""})
    let loading = ref(false)
    let beans = ref([])
    let showEdit    = ref(false)
    let bean        = ref({})
    let isNew       = ref(false)

    let height = "calc(100% - 120px)"
    let columns = [
        { title:"序号", align:"center", width:70, render:(row, index)=>index+1 },
        { title:"IP地址", key:"id", width:120 },
        { title:"名称", key:"name", width:180 },
        { title:"授权用户ID", key:"ids", width:200, ellipsis:true},
        { title:"TOKEN期限", key:"expire", width:110, render: row=> `${row.expire} 分钟`},
        { title:"说明", key:"summary", ellipsis:true},
        { title:"创建日期", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) },
        {
            width:100, align:"center",
            title: ()=> h(NSpace, {justify:"center"}, ()=>[
                UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
                UI.iconBtn(SyncAlt, refresh, {type:"primary", quaternary:false, secondary:true, title:"刷新列表数据"})
            ]),
            render:(row, index)=> [
                UI.iconBtn(Edit, ()=> toEdit(row)),
                h(
                    NPopconfirm,
                    {
                        onPositiveClick:()=> remove(row.id, index),
                        "positive-button-props": {type:"error"}
                    },
                    {
                        default: ()=>`删除⌈${row.id}⌋吗？`,
                        trigger: ()=>UI.iconBtn(Trash, null, {type:"error"})
                    }
                )
            ]
        }
    ]

    const refresh = ()=> RESULT("/system/member/list",{form}, d=> beans.value=d.data, {loading})

    const remove = (id, index)=>RESULT("/system/member/delete", {id},d=> {
        M.ok(`数据删除成功`)
        beans.value.splice(index, 1)
    })

    const toEdit = (row={ name:"新建会员终端", expire: 10})=> {
        isNew.value = !row.id
        bean.value = row
        showEdit.value = true
    }
    const toSave = ()=>{
        // let model = {}
        // Object.keys(bean.value).forEach(v=> model[v] = bean.value[v])
        RESULT("/system/member/create", bean.value, d=> {
            M.notice.ok(`会员终端⌈${bean.value.id}⌋保存成功`)
            showEdit.value = false

            refresh()
        })
    }

    const uuidFilter = value => !value || /^\w+$/.test(value)

    const createRsaKey = ()=> {
        if(bean.value.pubKey || bean.value.priKey)
            M.confirm(`随机生成密钥`, `此操作后将覆盖旧的密钥，确定吗？`, _createRsaKeyDo)
        else
            _createRsaKeyDo()
    }
    const _createRsaKeyDo = ()=> POST("/outreach/create-rsa-key",{}, d=> {
        bean.value.pubKey = d.data.pubKey
        bean.value.priKey = d.data.priKey
    })

    const createKey = ()=> GET("/outreach/create-aes-key",{}, d=> bean.value.secret=d)
    const copyKey = ()=> {
        H.copyTo(bean.value.secret)
        M.ok(`密钥已复制`)
    }
    onMounted( refresh )
</script>
