import { defineStore } from "pinia"

export const useHomeSetting = defineStore('home', {
    state: ()=>({
        sidebar: false,
        sidebarWidth: 320
    }),
    actions: {
        setSidebar(v){
            this.sidebar = v
            Config.isDev && H.log.debug(`用户切换首页边栏显示=${v}`)
        },
        setSidebarWidth(w){
            this.sidebarWidth = w
        }
    },
    persist: true
})
