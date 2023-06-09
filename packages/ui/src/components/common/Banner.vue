<template>
    <div>
        版权所有 © <span v-html="html"></span>
    </div>
</template>

<script setup>
    const props = defineProps({
        text:{type:String, default:`<a style="text-decoration: none; font-weight: 600;" target="_blank" href="https://github.com/0604hx">集成显卡</a> 2009-{{year}}`}
    })

    let html = H.io.render(props.text, {year: new Date().getFullYear(), version: window.VERSION})
</script>
