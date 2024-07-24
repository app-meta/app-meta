<template>
    <n-form :show-feedback="false" :label-width="75" label-placement="left" label-align="right">
        <n-space v-if="mode==1" vertical :size="compact?'small':'medium'">
            <AttrLine v-for="item in items" :label="item.label" v-model:value="bean[item.id]" :summary="item.summary"
                :widget="item.widget" :prefix="item.prefix" :suffix="item.suffix" :options="item.options" :rows="item.rows"
            />
        </n-space>
        <div v-else-if="mode==0" class="text-center"><n-spin></n-spin></div>
        <div v-else class="text-center">
            <n-text depth="3">请选择左侧控件以编辑属性</n-text>
        </div>
    </n-form>
</template>

<script setup>
    import { ref, computed, watch, nextTick, h } from 'vue'

    import AttrLine from "@grid-form/designer/components/attribute-line.vue"

    const emits = defineEmits([])
    const props = defineProps({
        bean: {type:Object},
        items: {type:Array, default:[]},
        compact:{type:Boolean, default: false}
    })

    let mode = ref(-1)

    watch(()=> props.bean, v=>{
        mode.value = 0
        nextTick(()=> mode.value = 1)
    })
</script>
