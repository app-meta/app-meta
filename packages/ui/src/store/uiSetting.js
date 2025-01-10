/*
 * @Author: 0604hx/集成显卡
 * @Date: 2022-03-26 21:58:12
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2024-12-20 09:19:18
 *
 * UI 相关配置
 */
import { defineStore } from 'pinia'
import { generate, getRgbStr } from '@arco-design/color'


/**
 * 主配色
 * 色彩来源 https://ant-design.antgroup.com/docs/spec/colors-cn
 * 感谢 ant-design 项目😄
 */
const colors = {
    '默认': '#36ad6a',
    '企业蓝': '#1677ff',
    '极客蓝': '#1d39c4',
    '法式洋红': '#c41d7f',
    '酱紫': '#531dab',
    '明青': '#08979c',
    '极光绿': '#389e0d',
    '日出': '#d4b106',
    '金盏花': '#d48806',
    '日暮': '#d46b08',
    '火山': '#d4380d',
    '薄暮': '#cf1322',
}

/**
 * 判断是否为深色
 * @param {String} theme
 * @returns
 */
export const detectDark = (theme='auto')=>{
    if(theme == 'dark')     return true
    if(theme == 'light')    return false

    let hour = new Date().getHours()
    return hour >= 18 || hour<=8
}

export { colors }

export const defaultPrimaryColor = '#18a058'

export const useUISetting = defineStore('ui', {
    state: ()=>({
        theme: "auto",
        color: defaultPrimaryColor,
        darkNav: true,
        openBlank: true,
        naiveThemeOverrides : { common: {} }
    }),
    actions: {
        initValue (computeColor=false) {
            let code = detectDark(this.theme)
            //写入全局变量
            window.DARK = code
            window.OPEN_BLANK = this.openBlank
            window.color = colors[this.color||"默认"]

            if(computeColor)
                this.setColor()
            else
                document.body.style.setProperty('--primary-color', window.color)
        },
        setTheme(theme) {
            if(this.theme == theme) return

            this.theme = theme
            this.initValue(true)
        },
        setDarkNav (v){
            this.darkNav = v
        },
        setColor (color=this.color) {
            let c = colors[color||"默认"]
            if(!c)  return

            this.color = color

            const cs = generate(c, { list: true, dark: window.DARK })

            // 代码参考 https://github.com/zclzone/vue-naive-admin/blob/2.x/src/store/modules/app.js
            document.body.style.setProperty('--primary-color', getRgbStr(cs[5]))
            this.naiveThemeOverrides.common = Object.assign(this.naiveThemeOverrides.common || {}, {
                primaryColor: cs[5],
                primaryColorHover: cs[4],
                primaryColorSuppl: cs[4],
                primaryColorPressed: cs[6]
            })
        },
        setOpenBlank(v){
            this.openBlank = window.OPEN_BLANK = v === true
        }
    },
    persist: true
})
