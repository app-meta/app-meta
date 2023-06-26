<template>
    <n-data-table v-if="ok" :columns="columns" class="db-table-view" :data="rows" :style="{height}" :bordered="false" striped size="small"
        :scroll-x="scrollX" flex-height :row-props="rowProps" />
</template>

<script setup>
    import { ref, nextTick, h } from 'vue'

    import TableExpand from "./table-expand.vue"

    const emits = defineEmits(["edit"])
    const props = defineProps({
        height: {type:[Number, String], default:"100%"},
    })
    const resizable = true
    const ellipsis  = true
    const width     = 120

    let ok = ref(false)
    let scrollX = ref(window.screen.availWidth - 50)
    let heads = []
    let columns = []
    let rows = []

    const rowProps = (row, index)=>({
        ondblclick: e=> emits("edit", row)
    })

    const update = (items, head=true) => {
        ok.value = false
        nextTick(()=> {
            if(head){
                let hs = items.shift()
                heads = (Array.isArray(hs)?hs:[hs])
                let cs = heads.map((key, i)=>({ title: key, key:i, resizable, ellipsis, width, render:row=> row[i],className:"db-cell" }))
                if(cs.length>1){
                    //增加展开行
                    cs.unshift({
                        type: "expand",
                        renderExpand: bean => h(TableExpand, {heads, bean}) // JSON.stringify(row)
                    })
                }
                scrollX.value = cs.length * width + 100
                columns = cs
            }
            //适配 expand
            rows = items.map((v,key)=>{
                if(!Array.isArray(v))    return {key, 0: v}

                let vv = {key}
                v.forEach((_v, i)=> vv[i]=_v)
                return vv
            })
            ok.value = true
        })
    }

    defineExpose({ update })
</script>

<style lang="less">
    .db-table-view {
        .db-cell {
            padding:2px !important;
        }
    }
</style>
