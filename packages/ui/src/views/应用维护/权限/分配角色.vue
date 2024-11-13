<template>
    <n-form label-width="120" label-placement="left">
        <n-form-item label="用户ID">
            <n-input type="textarea" v-model:value="link.uid" placeholder="请填写ID，多个用英文逗号分开" />
        </n-form-item>
        <n-form-item label="分配角色">
            <n-select :options="data" v-model:value="link.role"></n-select>
        </n-form-item>
    </n-form>
</template>

<script setup>
    import { ref } from 'vue'

    let port    = ref()
    let loading = ref(false)

    const dealDo = stop => RESULT("/system/os/port", { key: port.value, enable: stop }, d=>{
        if(!stop){
            M[d.data?"info":"warn"](`端口 ${port.value} ${d.data?"正在":"未"}使用`)
        }
        else{
            M.ok(`操作完成`)
        }
    }, { loading })

    const deal = (stop=false)=>{
        if(!port.value)         return M.warn(`请输入有效端口号`)
        if(port.value < 1000)   return M.warn(`端口不能小于 1000`)

        if(!stop)               return dealDo(stop)

        M.confirm(`停止端口关联进程`, `确认进行此操作吗？请慎重`, ()=> dealDo(stop))
    }
</script>
