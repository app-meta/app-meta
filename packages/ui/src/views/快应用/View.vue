<template>
    <div v-if="state==-1" class="text-center">
        <n-spin size="large"></n-spin>
    </div>
    <component v-else-if="state==0" :is='defaultHome()'></component>
    <template v-else-if="state==1">
        <component :is="viewer()" />

        <BottomMenu :page="bean.page" />
    </template>
    <template v-else>
        <n-alert v-if="state==2" title="应用/页面不存在" type="error">
            您尝试访问的应用 <n-tag :bordered="false" type="info">{{aid}}</n-tag>
            <template v-if="pid"> / 资源  <n-tag :bordered="false" type="info">#{{pid}}</n-tag></template>
            不存在，请检查后再试。
        </n-alert>
        <n-alert v-else-if="state==3" title="应用/页面不可见" type="warning">
            您尝试访问的应用
            <n-tag :bordered="false" type="info">{{aid}}</n-tag> /
            <n-tag :bordered="false" type="info">{{bean.page.name||('#'+pid)}}</n-tag>
            未开放，请联系应用管理员开启后再重试。
        </n-alert>
        <n-alert v-else-if="state==4" title="服务未授权" type="warning">
            您未获得应用
            <n-tag :bordered="false" type="info">{{aid}}</n-tag> /
            <n-tag :bordered="false" type="info">{{bean.page.name||('#'+pid)}}</n-tag>
            的使用权限，请联系应用管理员授权后再重试。
        </n-alert>

        <About class="mt-4" />
    </template>
</template>

<script setup>
    import { ref, watch,onMounted, h, reactive, nextTick } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    const route = useRoute()
    let { aid, pid }   = route.params

    import DocumentRender from "./文档页/Render.vue"
    import FormRender from './表单页/Render.vue'
    import TableDataRender from "./数据表格/Render.vue"
    import WenjuanRender from "./问卷/Render.vue"
    import DataRender from "./数据分发/Render.vue"
    import BlockRender from "./数据维护/Render.vue"
    import ChartRender from "./统计图表/Render.vue"
    import SFCRender from "./SFC/Render.vue"

    import DefaultHome from "./Home.vue"
    import About from "./about.vue"
    import BottomMenu from "./bottom-menu.vue"

    import { loadContent, isUnLimitPageId } from "."

    const channel =  window.isClient?"client":"browser"

    const bean = reactive({app:{}, page:{}})
    /**
     * 状态：-1=加载中，0=系统自带的默认首页，1=页面可正常访问，2=页面不存在，3=页面不可见，4=页面未授权
     */
    let state   = ref(-1)
    let data    = undefined

    let viewer  = ()=> {
        let tpl = bean.page.template
        let com =
            tpl=='markdown'?    DocumentRender:
            tpl=='form'?        FormRender:
            tpl=='table'?       TableDataRender:
            tpl=='wenjuan'?     WenjuanRender:
            tpl=='data'?        DataRender:
            tpl=='import'?      BlockRender:
            tpl=='chart'?       ChartRender:
            tpl=='sfc'?         SFCRender:
            null
        if(com == null) throw Error(`应用⌈${bean.page.name}⌋未定义对应的渲染器，请联系管理员`)
        return h(com, {data, aid, page: bean.page})
    }

    const defaultHome = ()=> h(DefaultHome, {app: bean.app})

    const refresh = ()=>RESULT("/page/main", {pid, aid},  d=>{
        let { page, app } = d.data
        if(!app || !app.id || (!!pid && !page)) return state.value = 2

        bean.app    = app

        //没有默认页面时，显示自带的应用首页
        if(!page){
            console.debug(`检测到应用未配置主页面，即将使用默认主页...`)
            H.setTitle(app.name)
            return state.value = 0
        }

        let {id, name, template, active} = page

        bean.page   = page
        if(active != true)  return state.value = 3

        if(!pid || pid == '0')  pid = id

        H.setTitle(name)

        loadContent(pid)
            .then(dd=>{
                console.debug(dd, state.value)
                if(dd.success != true){
                    return state.value = 4
                }
                //运行小程序
                if(template === 'h5')
                    return FETCH_JSON(window.SERVER+"/app/launch", {aid, pid, channel}, true).then(()=> location.href = dd.data)

                data = dd.data
                state.value = 1

                //初始化 DATA 模块，对于 table 类型，无需注入 pid（可以自由查询数据）
                H.data.init({aid, pid: isUnLimitPageId(template)?"": pid, prefix: window.SERVER, debug: process.env.NODE_ENV !== "production"})

                setTimeout(()=> FETCH_JSON(window.SERVER+"/app/launch", {aid, pid, channel}, true), 5000)
            })
            .catch(e=> state.value = 4)
        }
    )

    watch(route, ()=>{
        if(route.name == "app-view"){
            let { params } = route
            if(params.aid != aid || params.pid != pid){
                aid = params.aid
                pid = params.pid

                H.data.reset()
                state.value = -1
                nextTick(refresh)
            }
        }
    })

    onMounted( refresh )
</script>
