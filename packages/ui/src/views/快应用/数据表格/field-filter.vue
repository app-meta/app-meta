<template>
    <n-input-group>
        <n-select :size="size" v-model:value="bean.field" :options="fields" :style="{ width: '35%' }" placeholder="字段" />
        <n-select :size="size" v-model:value="bean.op" :disabled="opLock" :options="operations" :style="{ width: '25%' }" />
        <n-input  :size="size" v-model:value="bean.value" :style="{ width: '40%' }" placeholder="筛选值" />
        <n-button :size="size" :class="trashClass" title="移除筛选项" @click="()=> emits('delete')"><template #icon><n-icon :component="TrashAlt" /> </template></n-button>
    </n-input-group>
</template>

<script setup>
    import { ref } from 'vue'
    import { TrashAlt } from "@vicons/fa"

    import { operations } from './'

    const emits = defineEmits(['delete'])
    const props = defineProps({
        bean:{ type:Object },
        fields:{type: Array},
        size:{type:String, default:"small"},
        trashClass:{type:String, default:"error"},
        opLock:{type:Boolean, default: false}
    })
</script>
