import { ref, onMounted,reactive, createVNode } from 'vue'
import { useRouter } from "vue-router"

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

    let onLoginDone = token=>{
        localStorage.setItem(MUA, token)
        localStorage.removeItem("CAS-TOKEN")

        M.ok(`认证成功^.^`)
        E.emit("login-done")

        let redirectUrl = localStorage.getItem(REDIRECT) || "/"
        if(!Config.isDev) localStorage.removeItem(REDIRECT)
        return redirectUrl
    }

    return { working, loginWithPwd, onLoginDone, router }
}
