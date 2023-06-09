<!--
    代码编辑器
    更多配置请参考 https://github.com/surmon-china/vue-codemirror
-->
<template>
    <codemirror
        v-model="code"
        :placeholder="placeholder"
        :style="{ height }"
        :autofocus="autofocus"
        :indent-with-tab="true"
        :tab-size="tabSize"
        :disabled="readOnly"
        :extensions="extensions"
        @change="v=>emits('update:value', v)"
    />
</template>

<script setup>
    import { ref,onMounted, watch } from 'vue'

    import { Codemirror } from 'vue-codemirror'
    import { javascript } from '@codemirror/lang-javascript'
    import { html } from '@codemirror/lang-html'
    import { oneDark } from '@codemirror/theme-one-dark'

    const emits = defineEmits(['update:value'])
    const props = defineProps({
        value:{type:String, default:""},
        readOnly:{type:Boolean, default:false},
        autofocus: {type:Boolean, default:false},
        tabSize:{type:Number, default:4},
        height: {type:String, default:"300px"},
        placeholder:{type:String, default:"请输入代码"},
        language:{type:String, default:"js"}
    })

    const extensions = [props.language=='html'?html(): javascript()]
    if(window.DARD === true)  extensions.push(oneDark)

    let code = ref(props.value)

    watch(()=>props.value, ()=> code.value=props.value)

    onMounted(() => {
    })
</script>
