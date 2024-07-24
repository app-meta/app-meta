<template>
    <n-card segmented content-style="padding:0px">
        <template #header>
            <Cog class="icon" />
            系统设置
            <n-text depth="3" class="text-sm ml-2">修改配置可能影响到系统的正常运作，请慎重操作</n-text>
        </template>

        <n-form :label-width="labelWidth">
            <template v-for="g in groups">
                <n-card v-if="g.size" size="small" class="mb-2" :bordered="false" segmented>
                    <template #header> <n-tag :bordered="false" type="primary" size="large">{{g.title}}</n-tag></template>
                    <n-table size="small" :bordered="false">
                        <template v-for="item in settings">
                            <tr v-if="item.category==g.group">
                                <td :width="labelWidth" class="text-right"> {{item.title}} </td>
                                <td width="40%">
                                    <n-input v-if="item.form=='TEXT' || item.form=='TEXTAREA'" :rows="3" :status="item.old!=item.content?'warning':null" :type="item.form" v-model:value="item.content" />
                                    <n-input-number v-else-if="item.form=='NUMBER'" :status="item.old!=item.content?'warning':null" v-model:value="item.content" />
                                    <n-select v-else-if="item.form=='SELECT'" v-model:value="item.content" :options="item.items" :status="item.old!=item.content?'warning':null"/>
                                    <n-switch v-else-if="item.form=='RADIO'" v-model:value="item.content" />
                                </td>
                                <td><n-text depth="3">{{item.summary}}</n-text></td>
                            </tr>
                        </template>
                    </n-table>
                </n-card>
            </template>
        </n-form>

        <div class="text-center">
            <n-button type="primary" size="large" :disabled="changed==0" @click="saveDo"><template #icon><n-icon :component="CheckCircle" /></template> 保存已修改</n-button>
            <div>共有 <b>{{changed}}</b> 处改动</div>
        </div>
    </n-card>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { Cog, CheckCircle } from '@vicons/fa'

    const props = defineProps({
        prefix:{type:String, default:"/system/setting"},
        groupNames:{type: Object, default:()=>{return {}}},
        labelWidth:{type:Number, default: 180},
    })

    let tab = ref("")
    let settings = ref([])
    let groups = ref([])

    const changed = computed(()=> settings.value.filter(v=>v.old != v.content).length)

    let saveDo = ()=>settings.value.filter(s=>s.old!=s.content).forEach(s=>{
        console.debug("更新配置：", s)
        RESULT(`${props.prefix}/modify`, s, d=>{
            console.debug("配置更新成功：", s.uuid, s.content)
            s.old = s.content
            M.notice.ok(`更新配置：${s.title}`)
        })
    })

    onMounted(() => {
        RESULT(`${props.prefix}/list`, {pageSize:1000, "SORT_sort":-1}, d=>{
            let _groups = [
                {group:null, title:"默认分组", summary:"", size:0 },
                {group:"COMMON", title:"基础配置", summary:"", size:0 },
                {group:"SYSTEM", title:"系统相关", summary:"系统级别配置项", size:0},
                {group:"AUTH", title:"用户权限", summary:"", size:0 },
                {group:"CONTENT", title:"内容/文档", summary:"", size:0},
            ]

            d.data.forEach(s=>{
                s.old = s.content

                //对于下拉框，需要解析其 formValue
                if(s.form == "SELECT" && s.formValue){
                    s.items = UI.buildOptions(s.formValue)
                }
                else if(s.form == "RADIO"){
                    s.content = s.old = s.content == 'true'
                }
                else if(s.form == "NUMBER"){
                    s.content = s.old = Number(s.content)
                }
                let g = _groups.filter(g=>g.group==s.category)
                if(!g.length){
                    //增加分组
                    _groups.push(
                        Object.assign(
                            {group: s.category, title:s.category, size:1 },
                            props.groupNames[s.category]||{}
                        )
                    )
                }
                else
                    g[0].size ++
            })

            groups.value = _groups
            settings.value = d.data
        })
    })
</script>
