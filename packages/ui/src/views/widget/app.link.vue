<template>
    <n-button :title="text" :type="color" text circle @click.stop="doLink">
        <template #icon> <n-icon :component="icon" /> </template>
    </n-button>
</template>

<script setup>
    import { ref, onMounted,computed } from 'vue'
    import { HeartRegular, Heart,ThumbsUpRegular, ThumbsUp } from "@vicons/fa"

    const emits = defineEmits(["mark", "thumb", "unMark", "unThumb"])
    const props = defineProps({
        id:     { type: String },
        mark:   { type: Boolean, default: false },        //收藏操作
        thumb:  { type: Boolean, default: false },       //点赞操作
        linked: { type:Boolean, default: false },       //是否已经关联
        auto:   { type: Boolean, default: false },        //是否自动检测关联状态
        color:  { type:String, default:"default" }
    })

    let type = props.thumb? 1:0
    let linked = ref(props.linked)

    let icon = computed(()=> props.mark?(linked.value? Heart:HeartRegular):( linked.value?ThumbsUp: ThumbsUpRegular ))
    let text = computed(()=> `${linked.value?"取消":""}${props.mark?"收藏":"点赞"}该应用`)

    const doLink = ()=> linked.value? unLink(): toLink()

    const afterLink = ()=>{
        M.ok(`操作完成`)
        emits(linked.value? (type==0?"unMark": type==1?"unThumb":""): (type==0?"mark":"thumb"))

        if(props.auto)
            linked.value = !linked.value
    }

    const toLink = ()=> RESULT("/app/link/make", {aid: props.id, type}, afterLink)

    const unLink = ()=> RESULT("/app/link/remove", {aid: props.id, type}, afterLink)

    onMounted(() => {
        if(props.auto){
            RESULT("/app/link/check", {aid: props.id, type}, d=> linked.value = d.data===true)
        }
    })
</script>
