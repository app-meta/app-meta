import { ref, onMounted,reactive, createVNode } from 'vue'
import { useRouter } from "vue-router"

import { defaultRoute } from '@S/Auth'

const REDIRECT = "LOGIN-REDIRECT"
const MUA = "MUA"

export default ()=>{
    let working = ref(false)

    const router = useRouter()

    /**
     * 以账密形式进行登录
     * @param {*} uid
     * @param {*} pwd
     * @returns
     */
    let loginWithPwd = (uid, pwd)=>{
        return new Promise((ok, fail)=>{
            RESULT("/login_with_pwd", {uid, pwd: btoa(H.secret.md5(pwd))},  d=>ok(d.data), { loading: working, fail })
        })
    }

    /**
     * 登录成功后的回调，尝试进入登录前访问的页面（不存在则进入首页）
     * @param {String} token
     * @param {String} jumpUrl
     * @returns
     */
    let onLoginDone = (token, jumpUrl)=>{
        localStorage.setItem(MUA, token)
        localStorage.removeItem("CAS-TOKEN")

        M.ok(`认证成功^.^`)
        E.emit("login-done")

        let redirectUrl = jumpUrl
        if(!redirectUrl){
            redirectUrl = localStorage.getItem(REDIRECT) || defaultRoute
            if(!Config.isDev) localStorage.removeItem(REDIRECT)
        }

        if(!!redirectUrl){
            if(redirectUrl.startsWith("#")) redirectUrl = redirectUrl.substring(1)
            router.replace(redirectUrl)
        }
    }

    return { working, loginWithPwd, onLoginDone, router }
}
