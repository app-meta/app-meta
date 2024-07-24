<template>
    <n-spin v-if="loading" size="small"></n-spin>
    <template v-else>
        <n-text v-if="bean.roles.length==0" depth="3">⌈{{bean.name}}⌋暂未配置角色</n-text>
        <template v-else>
            <div>⌈{{bean.name}}⌋已配置 {{bean.roles.length}} 个角色：</div>
            <Tag v-for="item in bean.roles" class="mr-2">{{item}}</Tag>
        </template>
    </template>
</template>

<script setup>
    import { ref,onMounted } from 'vue'

    const props = defineProps({bean:{type:Object}})

    let loading = ref(true)

    onMounted(() => {
        if(props.bean.roles == null){
            RESULT("/system/account/detail", {id:props.bean.id},d=>{
                props.bean.roles = d.data.roles
                loading.value = false
            })
        }
        else
            loading.value = false
    })
</script>
