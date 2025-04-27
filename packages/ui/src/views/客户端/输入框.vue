<template>
    <n-space vertical>
        <CodeEditor v-if="type=='code'" v-model:value="text" height="calc(100vh - 110px)" :tabSize="4" />
        <n-input v-else v-model:value="text" :type :rows placeholder="请输入内容"></n-input>
        <div class="text-center">
            <n-button type="primary" @click="onOk">确定</n-button>
        </div>
    </n-space>
</template>

<script setup>
    import { ref } from 'vue'
    import { useRoute } from 'vue-router'

    import CodeEditor from "@code.editor"

    const type = useRoute().query.type??"text"
    const rows = type=='textarea'? parseInt((window.innerHeight-110)/22) : 1

    let text = ref("")

    const onOk = ()=> META.onInput(text.value)
</script>
