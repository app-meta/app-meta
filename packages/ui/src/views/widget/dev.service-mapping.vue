<!--本地项目配置页-->
<template>
    <n-space vertical>
        <n-alert :bordered="true" type="info" :show-icon="true">
            转发后端服务请求到指定地址，在本地开发时非常有用，注意：
            <ol>
                <li>1、映射格式为：应用ID+空格+服务地址（http 开头，不以 / 结尾）</li>
                <li>2、仅当前浏览器内有效</li>
                <li>3、上线时请及时删除映射，以免功能无法正常使用</li>
            </ol>
        </n-alert>

        <n-input v-model:value="text" type="textarea" :rows="4" placeholder="一行一个映射关系" />

        <n-button type="primary" @click="onOk" block>确定</n-button>
    </n-space>

</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const KEY   = "dev.service"
    let text    = ref("")

    const onOk = ()=>{
        let mapping = {}
        text.value.trim().split("\n").map(v=>{
            let t = v.trim().split(" ")
            if(t.length>1) mapping[t[0]] = t[1]
        })
        H.store.set(KEY, H.io.compress(JSON.stringify(mapping)))
        M.notice.ok(`后端服务映射保存成功`)
    }

    onMounted(() => {
        let code = H.store.get(KEY)
        if(code){
            let mappings = JSON.parse(H.io.unCompress(code))
            text.value = Object.keys(mappings).map(k=> `${k} ${mappings[k]}`).join("\n")
        }
    })
</script>
