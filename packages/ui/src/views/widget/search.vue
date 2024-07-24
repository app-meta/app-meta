<template>
    <n-popover trigger="manual" :show="show" style="width: 320px" @clickoutside="onOutSide">
        <template #trigger>
            <n-input size="small" clearable v-model:value="keyword" round :loading="loading" :style="{width: (opening?220:70) + 'px'}" :placeholder="opening?'搜索应用或者功能页':''"
                @keyup="onKeyup" @focus="onFocus" @blur="onBlur" @clear="onClear">
                <template #prefix> <n-icon :component="Search" /> </template>
            </n-input>
        </template>
        <n-space vertical size="small" class="custom-btn-list">
            <n-button v-for="item in beans" size="small" quaternary block @click="run(item)">
                <div class="text-left w-full">
                    <n-tag :bordered="false" :type="item.pid?'info':'primary'" size="tiny" class="mr-1">{{item.pid?"页面":"应用"}}</n-tag>
                    <span v-html="item.name"></span>
                </div>
            </n-button>
            <n-text depth="3" class="text-xs ml-1" v-html="result"></n-text>
        </n-space>
    </n-popover>

    <!-- <n-modal v-model:show="show" preset="card" :style="{width: '1000px'}" :mask-closable="false">
        <n-input size="large" v-model:value="keyword" round @keyup="onKeyup" placeholder="搜索应用或者功能页">
            <template #prefix> <n-icon :component="Search" /> </template>
        </n-input>

    </n-modal> -->
</template>

<script setup>
    import { ref, nextTick } from 'vue'
    import { Search } from '@vicons/fa'

    let opening = ref(false)
    let keyword = ref("")
    let show    = ref(false)
    let loading = ref(false)
    let beans   = ref([])
    let result  = ref("")
    let text    = ""

    const onKeyup = e=>{
        if(e.code === 'Enter'){
            let newText = keyword.value.trim()
            if(newText.length <= 1) return M.warn(`检索关键字至少两位噢`)

            if(newText == text) return
            text = newText
            if(!text)  return

            let started = Date.now()
            RESULT(
                "/query", {text},
                d=>{
                    result.value = `找到相关内容 ${d.data.length} 个，耗时 ${((Date.now() - started)/1000).toFixed(3)} 秒`
                    d.data.forEach(v=>v.name=v.name.replace(text, `<span class="primary">${text}</span>`))
                    beans.value = d.data
                    nextTick(()=> show.value = true)
                },
                {loading}
            )
        }
    }

    const onFocus = ()=>{
        opening.value = true
        if(beans.value.length)  show.value = true
        // setTimeout(()=>{if(beans.value.length)  show.value = true}, 200)
    }

    const onBlur = ()=>{
        let text = keyword.value.trim()
        if(text) return

        opening.value = false
        if(show.value)  show.value = false
    }
    const onClear = ()=>{
        beans.value = []
        text = ""
        show.value = false
    }

    const onOutSide = ()=> show.value = false

    const toName = n=> n.replace(keyword.value, `<span class="primary">${keyword.value}</span>`)

    const run = row => H.app.runPage(row.aid, row.pid, true)
</script>
