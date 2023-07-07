<template>
    <n-spin v-if="!inited" class="text-center w-full">
        <template #description>模块初始化... </template>
    </n-spin>
    <template v-else>
        <div>
            <n-space>
                <Tag size="large">{{bean.type}}</Tag>
                <n-text class="text-3xl">{{bean.name}}</n-text>
                <n-select @update:value="onSelectDb" style="width:200px" filterable placeholder="请选择数据库" v-model:value="model.db" :options="dbOptions"></n-select>
                <n-select @update:value="onSelectTable" style="width:200px" filterable :placeholder="tableTip" v-model:value="model.table" :options="tableOptions"></n-select>
                <n-popover placement="bottom" trigger="click" @update:show="onDetail">
                    <template #trigger><n-button :disabled="!model.table" secondary title="选择表后可以查看其结构">显示表结构</n-button></template>
                    <n-spin v-if="loading"></n-spin>
                    <template v-else>
                        <n-table size="small">
                            <tr v-for="(item, i) in tableDetail">
                                <template v-if="i==0">
                                    <th class="text-center" v-for="v in item">{{v}}</th>
                                </template>
                                <template v-else>
                                    <td v-for="v in item">{{v}}</td>
                                </template>
                            </tr>
                        </n-table>
                        <div class="mt-2">
                            <n-text depth="3">展示 <Tag>DESC {表名};</Tag> 命令的结果</n-text>
                        </div>
                    </template>
                </n-popover>
            </n-space>
        </div>

        <n-tabs type="card"  @close="handleClose" closable class="mt-2" v-model:value="tab">
            <n-tab-pane :name="SQL" display-directive="show:lazy" tab="SQL 脚本" :closable="false">
                <!-- <n-input type="textarea" size="small" placeholder="请输入SQL代码，按 CTRL+ENTER / CTRL+SHIFT+ENTER（多行） 执行（注意查询添加 LIMIT 以提高性能）" :rows="8"
                    v-model:value="model.sql" @keyup="handleKeyUp" :loading="running" :readonly="running" /> -->
                <CodeEditor placeholder="请输入SQL代码，按 CTRL+ENTER / CTRL+SHIFT+ENTER（多行） 执行（注意查询添加 LIMIT 以提高性能）" :keyBinds="[{key:'Ctrl-Enter'}]"
                    @keyup="handleKeyUp" v-model:value="model.sql" ref="editor" language="sql" style="height: 190px;" />

                <TableView class="mt-3" ref="sqlResultTable" style="height: calc(100vh - 360px)"/>
            </n-tab-pane>
            <n-tab-pane v-for="item in panels" display-directive="show:lazy" :key="item.name" :name="item.name" :closable="true">
                <template #tab>
                    <n-popover>
                        <template #trigger>{{item.table}}</template>
                        表路径：{{item.name}}
                    </n-popover>
                </template>
                <TableViewer :sourceId="id" :db="item.db" :table="item.table" @edit="onRowEdit" />
            </n-tab-pane>
        </n-tabs>

        <RowEdit ref="rowEdit" :sourceId="id" />
    </template>
</template>

<script setup>
    import { ref, onMounted, reactive, nextTick } from 'vue'
    import { useRoute } from 'vue-router'

    import { loadItems, detectForm } from "."
    import TableView from "./table.vue"
    import TableViewer from "./TableViewer.vue"
    import RowEdit from "./row-edit.vue"
    import CodeEditor from "@C/editor.code.vue"

    const route = useRoute()
    const id = route.params.id

    const SQL = "_sql_"

    let inited = ref(false)
    let bean = ref({})
    let dbOptions = []
    let tableOptions = ref([])
    let model = reactive({db: undefined, table: undefined, sourceId:id, sql:""})
    let running = ref(false)
    let loading = ref(false)
    let tableDetail = ref([])
    let tableDatas = {}

    let tableTip = ref("请选择表")

    let tab = ref(SQL)
    let panels = ref([])

    let sqlResultTable = ref()
    let rowEdit = ref()

    const onDatabases = d=>{
        dbOptions = UI.buildOptions(d)
        inited.value = true
    }

    const handleKeyUp = ({ctrlKey, shiftKey, keyCode})=>{
        if(running.value === true)  return

        if(ctrlKey==true && keyCode==13){
            if(!H.hasText(model.sql))   return M.warn(`请输入 SQL 语句`)

            running.value = true
            let started = Date.now()
            RESULT("/dbm", Object.assign({}, model, {sql: H.secret.toBase64(model.sql), batch: shiftKey}), d=> {
                running.value = false
                let used = Date.now() - started
                M.info(`SQL${shiftKey?"(多行模式)":""} 执行完成（耗时 ${~~used} ms）`)

                sqlResultTable.value.update(d.data)
            }, {loading: running})
        }
    }

    const onSelectDb = v=> loadItems(id, v).then(d=>{
        tableOptions.value = UI.buildOptions(d)
        model.table = ""
        // M.ok(`切换数据库⌈${v}⌋（${d.length}个表）`)
        tableTip.value = `共 ${d.length} 个表`
    })

    const onSelectTable = table=>{
        let name = `${model.db}.${table}`
        let p = panels.value.find(p=>p.name==name)
        if(!p){
            panels.value.push({name, db:model.db, table})
        }
        tab.value = name

        tableDetail.value = []
    }

    const handleClose = name=>{
        let nameIndex = panels.value.findIndex(p=>p.name==name)
        if(nameIndex>=0){
            panels.value.splice(nameIndex, 1)
            if(name == tab.value){
                tab.value = panels.value.length==0? SQL : panels.value[Math.min(nameIndex, panels.value.length - 1)].name
            }
        }
    }

    /**
     * 展示表格详情（DESC 表名）：
     *
     * ["Field", "Type", "Null", "Key", "Default", "Extra"]
     * ["id", "varchar(30)", "NO", "PRI", null, ""]
     */
    const onDetail = v=> v && tableDetail.value.length==0 && _loadTableDetail().then(d=> tableDetail.value=d)

    const _loadTableDetail = ()=> new Promise(ok=>{
        let uuid = `${model.db}.${model.table}`
        if(tableDatas[uuid]) return ok(tableDatas[uuid])

        RESULT(
            "/dbm/items",
            { db:model.db, table:model.table, sourceId:id },
            d=> {
                tableDatas[uuid] = d.data
                ok(d.data)
            },
            { loading }
        )
    })

    const onRowEdit = (row,db,table)=>_loadTableDetail().then(d=> _rowEdit(d, row, db, table))

    const _rowEdit = (tableDetail, row, db, table)=>{
        let bean = tableDetail.slice(1).map((f, i)=>({id:f[0], type:f[1], pri:f[3]=='PRI', value: row[i], form: detectForm(f[1])}))
        if(!bean.some(b=>b.pri===true)) return M.notice.error(`未检测到数据表 ${model.db}.${model.table} 的主键信息，本次行数据编辑已中断`, "无法编辑该行数据")

        rowEdit.value.open(bean, db, table)
    }

    onMounted(() => {
        RESULT("/dbm/source/detail", {id}, d=> {
            let { data } = d
            if(data && data.id == id){
                if(data.db){
                    onDatabases(data.db)
                    // 自动选择数据库
                    nextTick(()=>{
                        onSelectDb(data.db)
                        model.db = data.db
                    })
                }
                else
                    loadItems(id).then(onDatabases)

                bean.value = data

                H.setTitle(data.name+" · 数据源管理面板")
            }
            else
                M.showError(`ID=${id} 的数据源不存在，请联系管理员`, "数据异常")
        })
    })
</script>
