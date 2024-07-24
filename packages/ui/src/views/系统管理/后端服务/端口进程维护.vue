<!--
通过端口反查 PID，并关闭
初衷为针对基于 PM2 部署后端应用时，停止应用无法关闭关联的进程，此时需要调用系统命令进行强制关闭
-->
<template>
    <n-alert type="error" :bordered="false" :show-icon="false">
        <Tag>注意</Tag>
        <div>1、此功能仅用于关闭顽固进程😀</div>
        <div>2、端口必须不小于 1000</div>
        <div>3、请慎用</div>
    </n-alert>
    <n-grid x-gap="8" :cols="12" class="mt-4">
        <n-gi span="6"><n-input-number v-model:value="port" :min="1000" placeholder="请输入端口" /></n-gi>
        <n-gi span="3"><n-button type="primary" secondary :loading block @click="deal(false)">占用检测</n-button></n-gi>
        <n-gi span="3"><n-button type="error" secondary block :loading @click="deal(true)">停止进程</n-button></n-gi>
    </n-grid>
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
