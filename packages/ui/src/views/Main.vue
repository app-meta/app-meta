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

    import { hasAnyRole, isAdminOr } from "@S/Auth"

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
    let otherMenus = []
    let padding = ref(12)
    let footer = h(Banner, {text: Config.footer||undefined})

    const buildMenus = ()=>{
        let items = [
            menuItem("home", "首页", Home),
            menuItem("app-mine", "我的应用", AppStore)
        ]
        if(isAdminOr("DBM", "DBM_ADMIN")){
            items.push(menuItem("dbm-source", "数据源维护", Database))
        }
        if(isAdminOr("API_ADMIN")){
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

    const buildOtherMens = ()=>{
        let items = [
            // 也可以设置子菜单
            // {
            //     label: '个人中心', key:"mine", icon:()=>UI.buildIcon(UserCircle),
            //     children:[
            //         { label: '我的关注', key:"mine-link", icon:()=>UI.buildIcon(Star) }
            //     ]
            // },
            { label: '我的应用', key:"app-mine", icon:()=>UI.buildIcon(AppStore) },
            { label: '我的关注', key:"mine-link", icon:()=>UI.buildIcon(Star) },
        ]
        if(isAdminOr("DEVELOPER")) items.push({ label:"访问本地前端项目", key:"dev-h5", icon:()=> UI.buildIcon(Html5) })

        items.push({ type:"divider"})
        return items
    }

    const otherMenuClick = name=> {
        if(name == 'dev-h5'){
            M.prompt(`访问本地前端项目`,{message:"在客户端中打开本地开发中的前端项目，此功能用于小程序开发测试", value:'http://localhost:'}).then(url=>{
                H.openUrl(url)
            })
        }
        else
            E.emit('jumpTo', {name})
    }

    E.on("main.padding", (v=12)=> padding.value=v)

    onMounted(() => nextTick(()=>{
        menus = buildMenus()
        otherMenus = buildOtherMens()

        inited.value = true
    }))
</script>
