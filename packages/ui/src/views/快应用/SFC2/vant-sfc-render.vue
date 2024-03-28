<template>
    <van-loading v-if="state==0" size="24px" vertical>组件渲染中...</van-loading>
    <!-- <component v-else-if="state==1" :is='com'></component> -->
    <div v-else-if="state==1" id="vantSFC"></div>
    <van-empty v-else-if="statue==-1" image="error" :description="error" />
</template>

<script setup>
    import { ref, markRaw, defineAsyncComponent, onMounted, nextTick } from 'vue'
    //使用当前 vue 对象（包含全局组件等）
    import * as vue from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    import { Loading as VanLoading, Empty as VanEmpty } from 'vant'

    /**
     * 引入 Vant
     */
    import * as vant from 'vant'
    import '@vant/touch-emulator'
    import 'vant/lib/index.css'

    import { loadModule } from 'vue3-sfc-loader'

    /*
    对常用组件的封装，传递给 SFC，使得实际渲染环境与开发环境引用路径一致
     */
    import Chart from "@C/chart.vue"
    import MDRender from "@C/markdown/md.viewer.vue"

    const props = defineProps({
        code:{type:String, default:""},
        done:{type:Function},
        fail:{type:Function}
    })

    let state = ref(0)
    let com = ref()
    let error = ""

    const refresh = ()=>{
        if(!props.code) return

        state.value = 0
        loadModule(`async-sfc.vue`, {
            moduleCache: {
                vue,
                vant,
                'vue-router'                : { useRoute, useRouter },

                "@C/chart.vue"              : Chart,
                "@C/markdown/md.viewer.vue" : MDRender,
            },
            getFile: () => props.code,
            addStyle: (name) => {},
        })
        .then(component=>{
            com.value = markRaw(component)
            state.value = 1

            nextTick(()=>{
                vue.createApp(component).use(vant).mount("#vantSFC")

                props.done && props.done()
            })
        })
        .catch(e=>{
            error = e
            state.value = -1
            props.fail && props.fail(e)
        })
    }

    onMounted( refresh )

    defineExpose({ refresh })
</script>
