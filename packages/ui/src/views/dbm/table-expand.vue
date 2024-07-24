<template>
    <n-table size="small" :bordered="false">
        <tr v-for="(item, index) in heads">
            <th width="150">{{item}}</th>
            <td @dblclick="showDetail(index, item)">{{bean[index]}}</td>
        </tr>
    </n-table>
</template>

<script setup>
    import { ref } from 'vue'

    const props = defineProps({
        heads:{type:Array},
        bean:{type:Object}
    })

    const showDetail = (index,key)=> M.showData(props.bean[index], { title:`字段⌈${key}⌋的详细内容`, pre:true})
</script>
