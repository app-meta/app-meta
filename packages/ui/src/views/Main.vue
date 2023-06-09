<template>
    <n-layout position="absolute">
        <n-layout-header :inverted="inverted" :style="{height: headerHeight}" class="px-4" bordered>
            <app-navigation v-if="inited" :inverted="inverted" :menus="menus" :otherMenus="otherMenus" :otherMenuClick="otherMenuClick" title-width="280px">
                <div :class="{white: inverted }">
                    <Back :color="inverted?'white':'black'" />
                    {{appName}}
                </div>

                <template #extra-left>
                    <SearchBar />
                </template>
            </app-navigation>
        </n-layout-header>
        <!--如需头部，设置 style top: 50px;-->
        <n-layout position="absolute" :style="{bottom:'36px', top: headerHeight}" class="layout" :content-style="{padding: padding+'px',height:'100%'}" :native-scrollbar="false">
            <router-view />
        </n-layout>
        <n-layout-footer position="absolute" style="height: 36px; padding:6px; text-align: center;" bordered>
            <component :is='footer' />
        </n-layout-footer>
    </n-layout>
</template>

<script setup>
    import { ref, h, watch, computed, onMounted, nextTick } from 'vue'
    import { RouterLink } from "vue-router"
    import {
        Home, Cog, Cogs, Wrench, Database, ShieldAlt, Parking,GlobeAsia, Icons, ChartPie, UserShield, AppStore, InfoCircle, Html5, Bullhorn,
        Star, Users, Sitemap, TachometerAlt, Server, IdCard ,BezierCurve, UserCircle
    } from "@vicons/fa"

    import Banner from "@CC/Banner.vue"
    import AppNavigation from "@C/Navigation.vue"
    import Back from "@CC/Back.vue"
    import SearchBar from "./widget/search.vue"

    import { hasAnyRole } from "@S/Auth"

    import { useUISetting } from "@/store/uiSetting"
    const uiSetting = useUISetting()

    const headerHeight = "40px"
    const inverted = computed(()=> uiSetting.darkNav)      //反转头部导航
    const inited = ref(false)

    const menuItem = (routeName, text, icon)=> ({
        label: () => h(RouterLink, { to: { name: routeName } }, ()=>text),
        key: routeName,
        icon: UI.buildIcon2(icon)
    })

    let appName = Config.name || _APPNAME_
    let menus = []
    let padding = ref(12)
    let footer = h(Banner, {text: Config.footer||undefined})

    const buildMenus = ()=>{
        let items = [
            menuItem("home", "首页", Home),
            menuItem("app-mine", "我的应用", AppStore)
        ]
        if(hasAnyRole("ADMIN", "DBM", "DBM_ADMIN")){
            items.push(menuItem("dbm-source", "数据源维护", Database))
        }
        if(hasAnyRole("ADMIN", "API_ADMIN")){
            items.push(menuItem("api", "开放接口", BezierCurve))
        }

        if(window.User && User.isAdmin){
            items.push({
                label:"管理员功能", key:"admin-menu", icon:UI.buildIcon2(ShieldAlt),
                children:[
                    menuItem("sys-dashboard", "数据总览", TachometerAlt),
                    menuItem("app-home", "应用管理", AppStore),
                    menuItem("sys-ui", "资源更新", Html5),
                    menuItem("sys-page-link", "页面关注维护", Star),
                    menuItem("sys-terminal", "后端服务", Server),
                    {
                        label:"组织及权限", key:"account", icon: UI.buildIcon2(Sitemap),
                        children:[
                            menuItem("sys-account", "用户管理", Users),
                        ]
                    },
                    {
                        label:"系统维护", key:"system", icon: UI.buildIcon2(Cog),
                        children:[
                            menuItem("sys-member", "授权会员终端", IdCard),
                            menuItem("sys-notice", "公告维护", Bullhorn),
                            menuItem("sys-setting", "系统设置", Wrench),
                        ]
                    }
                ]
            })
        }
        items.push(menuItem("o-about","关于", InfoCircle))
        return items
    }

    const otherMenus = [
        // {
        //     label: '个人中心', key:"mine", icon:()=>UI.buildIcon(UserCircle),
        //     children:[
        //         { label: '我的关注', key:"mine-link", icon:()=>UI.buildIcon(Star) }
        //     ]
        // },
        { label: '我的应用', key:"app-mine", icon:()=>UI.buildIcon(AppStore) },
        { label: '我的关注', key:"mine-link", icon:()=>UI.buildIcon(Star) },
        { type:"divider"},
    ]

    const otherMenuClick = name=> E.emit('jumpTo', {name})

    E.on("main.padding", (v=12)=> padding.value=v)

    onMounted(() => nextTick(()=>{
        menus = buildMenus()
        inited.value = true
    }))
</script>
