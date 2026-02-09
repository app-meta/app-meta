import { createRouter, createWebHashHistory } from 'vue-router'

import WindowView from "@V/Window.vue"
import { checkRole, tryLoginWithCAS } from "@S/Auth"

let isProduction = process.env.NODE_ENV == 'production'
let version = _VERSION_
const LOGIN = "login"
const IGNORES = [ LOGIN, 'login-cas', "app-form-designer", "logout", "app-view-public", "dev-vant-sfc" ]

/**
 *
 * @param {*} mainComponent
 * @param {*} ps
 *              homePage        默认跳转页面
 *              mainRoutes      主路由
 *              blankRoutes     全页面路由（适合做诸如 登陆页面 等没有导航的页面）
 *              windowRoutes    新开窗口路由（具备 footer）
 *
 * @returns  router 对象，可以在此基础上添加钩子（如 beforeEach）
 */
export default function ( mainComponent, ps) {
    ps = Object.assign({mainRoutes:[], blankRoutes:[], windowRoutes:[], homePage: "/home", customRoutes:[]}, ps||{})

    let appRouter = {
        path: "",
        name: "main",
        redirect:  ps.homePage,
        component: mainComponent,
        children: [
            ...ps.mainRoutes,
            { path: '/401', name: "401", component: () => import('@V/@COMMON/401.vue') },
            { path: '/403', name: "403", component: () => import('@V/@COMMON/403.vue') },
            { path: '/404', name: "404", component: () => import('@V/@COMMON/404.vue') },
        ]
    }

    /**
     * 通过新窗口打开的路由（仅包含页面 footer ）
     */
    let windowRouter = {
        path: '',
        component: WindowView,
        children:  ps.windowRoutes
    }

    let routes = [
        ...ps.blankRoutes,
        appRouter,
        windowRouter,
        ...ps.customRoutes,
        { path: '/login', name: 'login', component:()=> import('@V/登录/Login.vue') },
        {
            path: "/:pathMatch(.*)",
            redirect: "/404"
        }
    ]

    const router = createRouter({
        history: createWebHashHistory(),
        routes
    })

    router.beforeEach((to, from, next) => {
        if ( !IGNORES.includes(to.name) && !window.TOKEN ) {
            console.debug(`检测到用户未登录，即将跳转到登录页面`)

            return tryLoginWithCAS(to.fullPath) && next({ name: LOGIN })
        }
        else {
            //判断权限
            if (to.meta.role && !checkRole(to.meta.role)) {
                console.debug(`☹ ${to.name} (${to.fullPath}) 需要权限 ${to.meta.role}，请联系管理员授权 ☹`)
                return next({ name: P403 })
            }

            window.document.title = (to.meta.title?`${to.meta.title} ·`:window.Config.name??to.name) + ` (版本=${version})`
            next()
        }
    })

    return router
}
