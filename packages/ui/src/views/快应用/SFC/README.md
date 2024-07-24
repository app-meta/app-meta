# SFC/单文件组件
> 基于 vue3-sfc-loader 动态加载字符串并渲染为组件

## 示例

### 文档搜索首页
> 针对 template=markdown

```html
<template>
    <n-card size="large" title="知识库">
        <n-input v-model:value="keyword" size="large" :placeholder="tip" @keyup="onKeyup" :loading="pagination.loading">
            <template #prefix><i class="fa fa-search" /></template>
        </n-input>

        <div class="mt-2" v-if="searched">
            <n-data-table :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans" :style="{height}"
        :remote="true" :bordered="false" striped size="small" flex-height />
        </div>
        
        <n-grid :cols=2 :x-gap=10 class="mt-2">
            <n-gi>
                <n-card size="small" segmented>
                    <template #header> <i class="fa fa-fire primary" /> 热门文档 </template>
                    <n-space vertical>
                        <div v-for="item in tops" class="cursor-pointer" @click="toJump(item)">
                            <n-ellipsis :line-clamp=1 :tooltip=false :title="item.name"><Title :text="item.name" size="small" /></n-ellipsis>
                        </div>
                    </n-space>
                </n-card>
            </n-gi>

            <n-gi>
                <n-card size="small" segmented>
                    <template #header> <i class="fa fa-star primary" /> 我的收藏 </template>
                    <n-space vertical>
                        <div v-for="item in links" class="cursor-pointer" @click="toJump(item)">
                            <n-ellipsis :line-clamp=1 :tooltip=false :title="item.name"><Title :text="item.name" size="small" /></n-ellipsis>
                        </div>
                    </n-space>
                </n-card>
            </n-gi>
        </n-grid>
    </n-card>
</template>
<script setup>
    import { h, ref, onMounted, computed } from 'vue'
    import { useRouter } from "vue-router"
    
    import Title from "@V/widget/page.title.vue"
    import P from "@Pagination"

    const router = useRouter()
    const url = "/page/query"
    const height = "300px"
    const _form = (ps={})=> Object.assign({EQ_template:"markdown"}, ps)

    let size = ref(0)
    let keyword = ref("")
    let searched = ref(false)
    
    let { beans , form, pagination, refresh } = P({url, form:_form()}, false)

    const columns = [
        {title:"标题", key:"name", render:row=>h('div',{onClick:()=>toJump(row), class:"cursor-pointer"},h(Title, {text:row.name}))},
        {title:"创建者", key:"uid", width:100},
        {title:"热度",key:"launch",width:100}
    ]

    let tops = ref([])
    let links = ref([])
    
    let tip = computed(()=> `请输入关键字${size.value>0?`在 ${size.value} 篇文档中`:""}检索`)

    const onKeyup = ({keyCode})=>{
        if(keyCode==13){
            if(!keyword.value) return
            if(keyword.value.trim().length <= 1) return M.warn(`关键字至少两个字符`)
            
            M.info(`检索 ${keyword.value}`)
            form.value.LIKE_name = keyword.value
            
            searched.value = true
            refresh()
        }
    }

    const toJump = row=>{
        let r = router.resolve({name:`app-view`, params:{aid:row.aid, pid: row.id}})
        H.openUrl(r.href, {title: row.name, center:true, type:"" })    
    }

    onMounted(()=>{
        RESULT(url, { countOnly: true, form: _form()}, d=> size.value=d.data)

        RESULT(url, { form:_form({"SORT_launch":1}), pagination:{pageSize:10}, fields:['id','aid','name','launch','uid'] }, d=>tops.value=d.data)
        RESULT("/page/link/list", { form:_form(), pagination:{pageSize:10} }, d=>links.value=d.data)
    })
</script>
```
