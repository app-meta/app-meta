<template>
    <n-alert title="数据源管理" :bordered="false" type="info">
        注意，此功能仅为方便在 <Tag>WEB</Tag> 环境对数据库进行简单操作，请慎重使用。
        <div v-if="isAdmin">
            目前支持的数据库类型有 <Tag>MySQL</Tag>，使用时服务端需具备相应的网络访问权限。
            数据源创建后，需要 <n-button size="small" type="primary" secondary @click="authView.open()">分配权限</n-button> 才可正常被使用。
        </div>
        <div v-else>
            请联系平台管理员分配相关权限方可进行后续的操作。
        </div>
    </n-alert>

    <n-grid class="mt-3" :cols="6" :x-gap="16" :y-gap="16">
        <n-gi v-for="item in beans">
            <n-card size="small" footer-style="padding-bottom:5px; padding-top:5px; background: rgba(200, 200, 200, 0.1);" class="cursor-pointer" @click="toView(item)">
                <template #header>{{item.name}}</template>
                <template #header-extra>
                    <img v-if="item.type=='mysql'" src="@/assets/mysql.svg" />
                    <img v-else-if="item.type=='sqlite'" src="@/assets/sqlite.svg" />
                </template>
                <Tag>地址</Tag> {{item.host}}:{{item.port}}
                <div> <Tag>用户</Tag> {{item.username}} </div>

                <template v-if="isAdmin" #footer>
                    <n-space>
                        <n-button size="tiny" @click.stop="toEdit(item)" type="primary" quaternary circle><template #icon><n-icon :component="Edit" /></template> </n-button>
                        <n-button size="tiny" @click.stop="toLog(item)" type="primary" quaternary circle title="查看操作日志">
                            <template #icon><n-icon :component="ClockRegular" /></template>
                        </n-button>
                        <n-button size="tiny" @click.stop="toDel(item)" type="error" quaternary circle><template #icon><n-icon :component="Trash" /></template> </n-button>
                    </n-space>
                </template>
            </n-card>
        </n-gi>

        <n-gi v-if="isAdmin" class="cell flex" style="background: rgba(200, 200, 200, 0.1); border-radius: 4px; min-height: 120px; align-items: center; justify-content: center;">
            <n-button secondary size="large" type="primary" circle @click="toEdit()"><template #icon><n-icon :component="Plus" /></template> </n-button>
        </n-gi>
    </n-grid>

    <n-modal v-model:show="edit.show" :style="{width:'640px'}" preset="card" title="编辑数据源">
        <n-form :show-feedback="false" label-placement="left" label-width="60">
            <n-space vertical>
                <n-form-item label="名称"> <n-input v-model:value="bean.name" placeholder="数据源名称" /> </n-form-item>
                <n-form-item label="类型">
                    <n-select :options="types" v-model:value="bean.type"></n-select>
                </n-form-item>
                <n-form-item label="地址">
                    <n-input-group v-if="bean.type!='sqlite'">
                        <n-input v-model:value="bean.host"  placeholder="IP地址"/>
                        <n-input-group-label>:</n-input-group-label>
                        <n-input-number v-model:value="bean.port"  placeholder="端口" :show-button="false">
                            <template #suffix><Tag>端口</Tag></template>
                        </n-input-number>
                    </n-input-group>
                    <n-input v-else v-model:value="bean.host"  placeholder="文件相对地址（格式：应用ID/文件名）"/>
                </n-form-item>
                <n-form-item label="用户名">
                    <n-input v-model:value="bean.username"> <template #suffix> <n-icon :component="UserCircle" /> </template></n-input>
                </n-form-item>
                <n-form-item label="密码">
                    <n-input v-model:value="bean.pwd" type="password" placeholder="留空则为无需密码"> <template #suffix> <n-icon :component="ShieldAlt" /> </template></n-input>
                </n-form-item>
                <n-form-item label="库名">
                    <n-input v-model:value="bean.db" placeholder="限定数据库，留空则无限制"> <template #suffix> <n-icon :component="Database" /> </template></n-input>
                </n-form-item>
                <n-form-item label="备注"> <n-input type="textarea" :rows="3" v-model:value="bean.summary"  placeholder="备注信息"/> </n-form-item>
            </n-space>
        </n-form>

        <div class="text-right mt-3">
            <n-button type="primary" @click="addDo">确定并保存</n-button>
        </div>
    </n-modal>

    <AuthView ref="authView" />
</template>

<script setup>
    import { ref, onMounted, reactive } from 'vue'
    import { useRouter } from 'vue-router'
    import { Plus, UserCircle, ShieldAlt, Edit, Trash, Database, ClockRegular } from '@vicons/fa'

    import { hasAnyRole } from "@S/Auth"

    import { createSource, types, SQLITE } from "."
    import AuthView from "./权限分配.vue"

    const router = useRouter()

    let isAdmin = ref(false)
    let beans = ref([])
    let edit = reactive({show:false, isNew: false})
    let bean = ref({})
    let authView = ref()

    const refresh = ()=> RESULT("/dbm/source/list", {}, d=> beans.value = d.data)
    const toEdit = (row=createSource())=> {
        bean.value = row
        edit.isNew = !row.id
        edit.show = true
    }
    const addDo = ()=>{
        let { name, host, port, username, type } = bean.value
        if(!name || !host)    return M.warn(`名称、地址不能为空`)
        if(type != SQLITE){
            if(!username || !port)  return M.warn(`用户名、端口不能为空`)
        }

        RESULT("/dbm/source/add", bean.value, d=> {
            M.notice.ok(`数据源⌈${name}⌋编辑成功`)
            edit.show = false

            refresh()
        })
    }

    const toView = row=>{
        let r = router.resolve({name:`dbm-view`, params:{id: row.id}})
        H.openUrl(r.href, {title: row.name, center:true })
    }

    const toLog = row=>{
        let r = router.resolve({name:`dbm-log`, params:{id: row.id}})
        H.openUrl(r.href, {title: row.name, center:true, width: ~~(window.screen.availWidth*0.95)})
    }

    const toDel = ({id, name})=> M.confirm(`删除数据源`, `确定删除数据源⌈${name}⌋吗？`, ()=> RESULT("/dbm/source/delete", {id}, d=> {
        M.ok(`数据源已删除`)
        refresh()
    }))
    onMounted(()=>{
        isAdmin.value = hasAnyRole("ADMIN", "DBM_ADMIN")
        refresh()
    })
</script>
