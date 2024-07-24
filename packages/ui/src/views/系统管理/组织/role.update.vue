<template>
    <n-checkbox-group size="large" v-model:value="roles">
        <n-space vertical>
            <n-checkbox v-for="r in beans" :value="r.id">
                {{r.name}} / {{r.id}} <Tag v-if="r.admin">管理员</Tag>
                <div><n-text depth="3" class="text-xs">{{r.summary}}</n-text></div>
            </n-checkbox>
        </n-space>
    </n-checkbox-group>

    <div class="mt-2 text-right">
        <n-button type="primary" @click="toSave">保存角色配置信息</n-button>
    </div>
</template>

<script setup>
    import { ref,onMounted, unref } from 'vue'

    const props = defineProps({bean:{type:Object}})

    let beans = ref([])
    let roles = ref(props.bean.roles)

    const toSave = ()=> RESULT("/system/account/update-role", {id: props.bean.id, value: roles.value.join(",")}, ()=>{
        props.bean.roles = _(roles)
        M.notice.ok(`角色配置保存成功`)
    })

    onMounted(() => RESULT("/account/roles", {}, d=> beans.value = d.data))
</script>
