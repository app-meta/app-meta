<template>
    <div class="text-center">
        <n-spin size="large">
            <template #description>集中认证中，请稍候...</template>
        </n-spin>

        <div v-if="done" class="mt-3">
            <n-text>
                认证已通过，如无自动跳转，请点此
                <n-button size="small" text @click="toHome">跳转到首页</n-button>
            </n-text>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import L from "./"

    let done = ref(false)
    let { onLoginDone, router } = L()

    const toHome = ()=> location.href=''

    onMounted(() => {
        FETCH_JSON(`${window.SERVER}/login_with_cas?token=${localStorage.getItem("CAS-TOKEN")}`).then(d=>{
            if(d.success === true){
                done.value = true
                onLoginDone(d.data)
                // let url = onLoginDone(d.data)
                // if(url.startsWith("#")) url = url.substring(1)

                // router.replace(url)
            }
            else
                M.dialog({type:"error", title:"集中认证失败", content: d.message||d})
        })
    })
</script>
