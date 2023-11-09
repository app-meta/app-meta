/*
 * @Author: 0604hx/集成显卡
 * @Date: 2022-03-26 21:58:12
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2023-03-27 14:16:54
 *
 * UI 相关配置
 */
import { defineStore } from 'pinia'

let detectTheme = v =>{
    let theme = v || H.store.get("ui.theme", "auto")
    let _dark = theme==='dark'
    if(!_dark && theme==='auto'){
        let hour = new Date().getHours()
        _dark = hour >= 18 || hour<=8
    }
    return _dark?"dark":"light"
}

export const useUISetting = defineStore('ui', {
    state: () => ({
        theme: detectTheme(),           // light，dark，auto（自动）
        color: H.store.get('ui.color'),
        darkNav: H.store.get("ui.darkNav") !== "false"
    }),
    getters: {
        getTheme() {
            return this.theme
        },
        getDarkNav() {
            return this.darkNav
        }
    },
    actions: {
        updateTheme(theme) {
            this.theme = detectTheme(theme)
            H.store.set("ui.theme", theme)
        },
        updateDarkNav (v){
            this.darkNav = v
            H.store.set("ui.darkNav", v)
        },
        updateColor(color) {
            this.color = color
            H.store.set('ui.color', color)
        }
    }
})
