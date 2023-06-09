<template>
    <div class="waveWrapper waveAnimation">
        <div class="waveWrapperInner bgTop">
            <div class="wave waveTop"></div>
        </div>
        <div class="waveWrapperInner bgMiddle">
            <div class="wave waveMiddle"></div>
        </div>
        <div class="waveWrapperInner bgBottom">
            <div class="wave waveBottom"></div>
        </div>
    </div>
    <div class="grid grid-cols-1 gap-2 place-content-center" style="height: 100vh;z-index: 99;position: relative;">
        <div class="rounded-lg p-9 bg-gray-100" style="width: 520px; margin:0px auto;">
            <div class="text-center white mt-9">
                <div class="text-4xl text-gray-900">APP-META</div>
                <div class="text-sm text-gray-600">欢迎使用</div>
            </div>
            <div class="border-t-2 pt-3 mt-4">
                <n-input v-model:value="user.name" type="text" size="large" placeholder="用户名/ID" round>
                    <template #suffix><n-icon :component="User" class="text-gray-300" /></template>
                </n-input>
                <n-input v-model:value="user.password" class="mt-4" size="large" type="password" placeholder="用户密码" round>
                    <template #suffix><n-icon :component="Lock"  class="text-gray-300" /></template>
                </n-input>
            </div>
            <div class="mt-5 text-center">
                <n-button type="primary" :loading="working" round size="large" @click="toLogin">登录进入</n-button>

                <n-space class="mt-4" justify="center">
                    <n-button text title="访问 APP-META 源码" tag="a" target="_blank" href="https://github.com/0604hx/app-meta">
                        <template #icon> <n-icon :component="Github" class="white" /> </template>
                    </n-button>
                    <n-button text title="平台基于 Electron(原 Atom) 构建" tag="a" target="_blank" href="https://www.electronjs.org">
                        <template #icon> <n-icon :component="Atom" class="white" /> </template>
                    </n-button>
                    <n-button text title="基于 VUE3" tag="a" target="_blank" href="https://vuejs.org">
                        <template #icon> <n-icon :component="Vuejs" class="white" /> </template>
                    </n-button>
                </n-space>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { useRouter, useRoute } from "vue-router"

    import { Check, Github, Atom, Vuejs, User, Lock } from '@vicons/fa'

    import L from "./"

    const router = useRouter()
    const route = useRoute()

    let redirect = "/"

    let { working, loginWithPwd, onLoginDone } = L()
    const user = reactive({
        uid:"",
        pwd:""
    })

    let toLogin = ()=>{
        let {name, password} = user
        if(!name || !password) return M.warn(`用户名或者密码不能为空`)

        // API("sys-auth-login-api", _(user))
        loginWithPwd(name, password).then(token=>{
            onLoginDone(token)
            router.replace(redirect)
        })
    }

    onMounted(()=>{
        if(!!route.query.from)  redirect = route.query.from
    })
</script>

<style>
    @keyframes move_wave {
        0% {
            transform: translateX(0) translateZ(0) scaleY(1)
        }
        50% {
            transform: translateX(-25%) translateZ(0) scaleY(0.55)
        }
        100% {
            transform: translateX(-50%) translateZ(0) scaleY(1)
        }
    }
    .waveWrapper {
        overflow: hidden;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        margin: auto;
    }
    .waveWrapperInner {
        position: absolute;
        width: 100%;
        overflow: hidden;
        height: 100%;
        background-image: linear-gradient(to top, #86377b 20%, #27273c 80%);
    }
    .bgTop {
        z-index: 15;
        opacity: 0.5;
    }
    .bgMiddle {
        z-index: 10;
        opacity: 0.75;
    }
    .bgBottom {
        z-index: 5;
    }
    .wave {
        position: absolute;
        left: 0;
        width: 200%;
        height: 100%;
        background-repeat: repeat no-repeat;
        background-position: 0 bottom;
        transform-origin: center bottom;
    }
    .waveTop {
        background-size: 50% 100px;
    }
    .waveAnimation .waveTop {
    animation: move-wave 3s;
    -webkit-animation: move-wave 3s;
    -webkit-animation-delay: 1s;
    animation-delay: 1s;
    }
    .waveMiddle {
        background-size: 50% 120px;
    }
    .waveAnimation .waveMiddle {
        animation: move_wave 10s linear infinite;
    }
    .waveBottom {
        background-size: 50% 100px;
    }
    .waveAnimation .waveBottom {
        animation: move_wave 15s linear infinite;
    }
</style>

