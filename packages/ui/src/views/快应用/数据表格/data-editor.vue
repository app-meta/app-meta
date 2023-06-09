<template>
    <n-form class="mt-4" ref="formRef" label-placement="left" label-width="120" size="small" :show-feedback="false" require-mark-placement="right-hanging">
        <n-space vertical size="small">
            <n-form-item v-for="(item,key) in bean" :path="item.name" :label="names[key]||key">
                <n-input-number v-if="checkNumber(item)" v-model:value="bean[key]" />
                <n-input v-else v-model:value="bean[key]" />
            </n-form-item>
        </n-space>
        <!-- <n-grid :x-gap="12" :cols="2">
            <n-form-item-gi v-for="(item,key) in bean" :path="item.name" :label="key">
                <n-input-number v-if="checkNumber(item)" v-model:value="bean[key]" />
                <n-input v-else v-model:value="bean[key]" />
            </n-form-item-gi>
        </n-grid> -->
        <div class="text-center mt-2">
            <n-button size="large" type="primary" @click="toSubmit">保存修改</n-button>
        </div>
    </n-form>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const emits = defineEmits(['ok'])
    const props = defineProps({
        bean: {type:Object},
        id: {type:Number},
        aid: {type:String},
        names: {type:Object, default:()=>{}}
    })
    const key = H.secret.md5(JSON.stringify(props.bean))

    let checkNumber = v=> typeof(v)==='number'
    let toSubmit = ()=>{
        if(H.secret.md5(JSON.stringify(props.bean)) == key)  return M.warn(`检测到无变动`)

        H.data.update(props.id, props.bean).then(()=>{
            emits("ok")
            M.ok(`数据修改已保存`)
        })
    }
</script>
