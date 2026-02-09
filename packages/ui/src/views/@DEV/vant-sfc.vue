<!-- 此页面用于快捷测试 VANT 版本的 SFC -->
<template>
    {{text}}，counter = {{count}}
    <div>
        <van-space>
            <van-button type="primary" @click="()=>count++">点我+1</van-button>
            <van-button type="primary" @click="showOk">弹出通知</van-button>
        </van-space>
    </div>
</template>
<script setup>
    import { ref } from 'vue'
    import { Button as VanButton, Space as VanSpace } from 'vant'

    import '@vant/touch-emulator'
    import 'vant/lib/index.css'
    // 默认导入全部的 Vant 组件（van-xxxx 格式）
    // 同时支持扩展组件，注意引入路径不能修改（完整组件清单，请打开右上角帮助）

    let text = ref("这是一个基于 Vant4 的 SFC 模版（适配 PC 端、移动端）")
    let count = ref(0)

    const showOk = ()=>M.ok('操作成功')
</script>
