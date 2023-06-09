<!--二维数据表格-->
<template>
    <!-- <div v-if="loading" class="text-center"><n-spin></n-spin></div> -->
    <n-spin :show="loading">
        <div :style="{height: height+'px'}">
            <n-table v-if="Array.isArray(content)" size="small" :bordered="false" striped>
                <thead>
                    <tr>
                        <th v-for="item in content[0]">{{item}}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in content">
                        <tr v-if="index>0">
                            <td v-for="ii in item">{{ii}}</td>
                        </tr>
                    </template>
                </tbody>
            </n-table>
            <n-text v-else depth="3">无数据或者数据格式有误</n-text>
        </div>
    </n-spin>
</template>

<script setup>
    import { ref, watch } from 'vue'

    import { widgetProps, loadData } from "."

    const props = defineProps(widgetProps())

    let { loading, content } = loadData(props)
</script>
