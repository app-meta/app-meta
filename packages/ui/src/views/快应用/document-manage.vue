<!--附件管理-->
<template>
    <slot>
        <n-button @click="show=true"><template #icon><n-icon :component="File" /></template>附件管理</n-button>
    </slot>

    <n-modal v-model:show="show" preset="card" style="width: 1100px;" :mask-closable="false">
        <template #header>
            <n-tag :bordered="false" type="primary">附件管理</n-tag> {{title}}
            <n-text class="ml-2 text-xs" depth="3">附件通常显示在页面最下方</n-text>
        </template>
        <div style="min-height: 400px;">
            <n-spin :show="loading">
                <n-table :bordered="false" :bottom-bordered="false">
                    <thead>
                        <tr>
                            <th width="40">#</th>
                            <th width="250">文件名</th>
                            <th width="100">文件大小</th>
                            <th width="40">类型</th>
                            <th>备注</th>
                            <th width="90">上传者</th>
                            <th width="80">下载次数</th>
                            <th width="40" class="text-center">
                                <Uploader action="/page/document-upload" :data="bean" :noticeOnOk="false" @ok="uploadDone">
                                    <n-button type="primary" size="small" circle secondary><template #icon><n-icon :component="Plus" /></template></n-button>
                                </Uploader>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item,index) in items">
                            <td class="text-center">{{index+1}}</td>
                            <td><ClickInput :text="item.filename" :onUpdate="v=>onChange(item, v)"/></td>
                            <!-- <td><n-ellipsis>{{item.filename}}</n-ellipsis></td> -->
                            <td>{{filesize(item.size)}}</td>
                            <td><n-tag :bordered="false" size="small"> {{item.ext}}</n-tag></td>
                            <td><ClickInput :text="item.summary" :onUpdate="v=>onChange(item, v, 'summary')"/></td>
                            <td>{{item.uid}}</td>
                            <td>{{item.download}}</td>
                            <td>
                                <n-popconfirm :negative-text="null" @positive-click="()=>toDel(item, index)" placement="top-end">
                                    <template #trigger>
                                        <n-button type="error" size="tiny" circle><template #icon><n-icon :component="Trash" /></template></n-button>
                                    </template>
                                    删除附件⌈{{item.filename}}⌋吗？
                                </n-popconfirm>
                            </td>
                        </tr>
                    </tbody>
                </n-table>
            </n-spin>
        </div>
    </n-modal>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { Trash, File, Plus } from '@vicons/fa'

    import ClickInput from "@C/dbclick.input.vue"
    import Uploader from "@C/uploader.vue"

    const props = defineProps({
        aid: {type:String, default:""},
        pid: {type:String, default:""}
    })

    let pid     = ref(props.pid)
    let show    = ref(false)
    let items   = ref([])
    let title   = ref("")
    let loading = ref(false)

    const bean  = computed(()=>({pid: pid.value}))

    const refresh = ()=> pid.value && RESULT("/page/document-list", {id: pid.value}, d=> items.value = d.data, {loading})
    const filesize = r=> H.filesize(r)
    const uploadDone = d=> {
        items.value.push(d.data)
        M.ok(`上传附件⌈${d.data.filename}⌋`)
    }
    const onChange = (item, v, key='filename')=> {
        let model = {id:item.id, pid:item.pid}
        model[key] = v
        RESULT('/page/document-edit', model, d=> {
            item[key] = v
            M.ok(`信息已更新`)
        })
    }
    const toDel = (item, i)=> RESULT("/page/document-del", {id:item.id, pid:item.pid}, d=>{
        items.value.splice(i, 1)
        M.ok(`删除附件⌈${item.filename}⌋`)
    })
    const open = (_pid, _title="")=>{
        if(_pid && _pid != pid.value){
            pid.value = _pid
            refresh()
        }

        title.value = _title
        show.value  = true
    }

    onMounted( refresh )

    defineExpose({ open })
</script>
