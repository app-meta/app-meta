<template>
    <n-alert type="info" :bordered="false" title="动态加载 SFC 组件">
        使用开源工具
        <Tag><a href="https://github.com/FranckFreiburger/vue3-sfc-loader" target="_blank">vue3-sfc-loader</a></Tag>
        动态加载组件并展示
    </n-alert>

    <div class="mt-2">
        <component :is='com' text="你好"></component>
    </div>
</template>

<script setup>
    import { ref, defineAsyncComponent, onMounted, nextTick, markRaw } from 'vue'

    //使用当前 vue 对象（包含全局组件等）
    import * as vue from 'vue'
    import { loadModule } from 'vue3-sfc-loader'

    /*
    在 sfc 下无法正常引入非全局组件
    可以通过 moduleCache 传递，然后在 sfc 内 import xxxx from 'xxxx'
    */
    import ClickInput from "@C/dbclick.input.vue"


    const sfcContent = `
    <template>
        <n-card title="动态组件">
            <n-alert type="success">参数 text={{text}}</n-alert>

            <n-space class="mt-3">
                <n-button type='primary' @click="msg('主要按钮被点击')">主要按钮</n-button>
                <n-button type='info' @click="msg('提示按钮被点击', 'info')">提示按钮</n-button>
                <n-button type='warning' @click="msg('警告按钮被点击', 'warn')">警告按钮</n-button>
            </n-space>

            <n-space class="mt-3">
                <ClickInput :text="text" />
            </n-space>
        </n-card>
    </template>
    <script setup>
        import { ref } from 'vue'
        import ClickInput from 'ClickInput'

        const props = defineProps({
            text:{type:String, default:"Hello Dynamic Component!"}
        })

        const msg = (v, type='ok')=> M[type](v)
    <\/script>
    `


    let inited = ref(false)
    let com = ref()

    onMounted(() => {
        com.value = markRaw(defineAsyncComponent(()=> loadModule(`new-component.vue`, {
            moduleCache: { vue, ClickInput  },
            getFile: () => sfcContent,
            addStyle: () => {},
        })))
    })
</script>
