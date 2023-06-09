<template>
    <n-button :title="text" :type="color" text circle @click.stop="doLink">
        <template #icon> <n-icon :component="linked?Heart:HeartRegular" /> </template>
    </n-button>
</template>

<script setup>
    import { ref, onMounted,computed } from 'vue'
    import { HeartRegular, Heart } from "@vicons/fa"

    const emits = defineEmits(["change"])
    const props = defineProps({
        id:     { type: String },
        linked: { type:Boolean, default: false },           //是否已经关联
        auto:   { type: Boolean, default: false },          //是否自动检测关联状态
        color:  { type:String, default:"default" }
    })

    let linked = ref(props.linked)

    let text = computed(()=> `${linked.value?"取消":""}关注该页面`)

    const doLink = ()=> linked.value? unLink(): toLink()

    const afterLink = ()=>{
        M.ok(linked.value?"已取消关注":"页面关注成功")
        linked.value = !linked.value

        emits("change", linked.value)
    }

    const toLink = ()=> RESULT("/page/link/add", {pid: props.id}, afterLink)

    const unLink = ()=> RESULT("/page/link/remove/"+props.id, {}, afterLink)

    onMounted(() => {
        if(props.auto){
            RESULT("/page/link/check/"+props.id, {}, d=> linked.value = d.data===true)
        }
    })
</script>
