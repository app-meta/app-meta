<!--卡片形式显示应用信息-->
<template>
    <n-card size="small" @click="toRun" :bordered="true" class="hover" :class="{'cursor-pointer': runable, 'icon-card':true}"
        :header-style="{padding:'10px 5px 10px 10px'}" :segmented="{content: false}">
        <template #header>
            <div class="flex">
                <Logo style="min-width:35px" size="medium" :text="bean.abbr" />
                <div class="ml-2 flex-grow mt-1 ellipsis" :title="bean.name">{{bean.name}}</div>
            </div>
        </template>
        <template #header-extra>
            <n-space v-if="showAction" class="hover-item">
                <template v-if="!marked">
                    <LinkBtn :id="bean.id" mark />
                    <LinkBtn :id="bean.id" thumb />
                </template>
                <LinkBtn v-else :id="bean.id" mark linked />
            </n-space>
        </template>
        <div style="height: 48px;">
            <n-ellipsis v-if="bean.summary" :line-clamp="summaryLine" :tooltip="false" class="text-gray-500 text-sm">{{bean.summary}}</n-ellipsis>
            <div v-else class="h">暂无介绍</div>
        </div>

        <template #action v-if="showFooter">
            <n-space>
                <div title="热度（执行次数）"><Rocket class="icon" /> <Count :value="bean.launch"/></div>
                <div v-if="bean.mark" title="收藏数"><Fire class="icon" /> {{bean.mark}}</div>
                <div v-if="bean.thumb" title="点赞数"><ThumbsUpRegular class="icon" /> {{bean.thumb}}</div>
            </n-space>
        </template>
    </n-card>
</template>

<script setup>
    import { ref } from 'vue'
    import { Rocket, Fire, HeartRegular, Heart,ThumbsUpRegular } from "@vicons/fa"

    import Logo from "@VW/app.logo.vue"
    import LinkBtn from "@VW/app.link.vue"
    import Count from "@VW/count.vue"

    import { runApp } from "@S/Runner"

    const emits = defineEmits(["unmark", "mark"])
    const props = defineProps({
        bean: {type:Object},
        showFooter:{type:Boolean, default: true},
        showAction:{type:Boolean, default: false},
        runable:{type:Boolean, default: true},      //是否可以点击运行应用
        summaryLine:{type:Number, default: 3},
        marked: {type:Boolean, default: false},     //是否已经是收藏的 app，如果 true 则显示取消收藏
    })

    const toLink = type=> RESULT("/app/link/make", {aid: props.bean.id, type}, d=> M.ok(`操作完成`))
    const unLink = type=> RESULT("/app/link/remove", {aid: props.bean.id, type}, d=> {
        M.ok(`操作完成`)
        emits(type==0?"unmark": type==1?"unlike":"")
    })
    const toRun = ()=>{
        if(!props.runable)  return
        runApp(props.bean)
    }
</script>
