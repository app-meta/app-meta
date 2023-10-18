<template></template>
<script setup>
    import { ref, h } from 'vue'
    import { useMessage, useNotification, useDialog,NButton, NText, NCard, NSpace, NInput, NInputNumber, useLoadingBar, NTable, NTr, NTd, NTh, NTabs, NTabPane } from "naive-ui"

    import IFrame from "../common/iframe.vue"

    const notification  = useNotification()
    const message       = useMessage()
    const dialog        = useDialog()
    const loadingBar    = useLoadingBar()

    let showNotice = (title, content, type="info", meta, duration=5000)=> {
        console.debug(duration, type, meta)
        notification[type]({title, content,meta, duration})
    }
    let showMsg = (content, type="info")=> message[type](content)

    /**
     * data         需要显示的数组
     * onRowClick   行点击的回调函数
     */
    const renderTable = (data, onRowClick, ps={})=> {
        let id = `TABLE${Math.floor(Math.random()*1000)}`
        let handlerClick =  onRowClick && typeof(onRowClick)=='function'
        window._showDataTableId = id
        return h(
            NTable,
            { class:"m-dialog-table", size:"small", striped:true, singleColumn:true, id, ...ps },
            // ()=> data.map((row, rowIndex)=> h(
            //     NTr,
            //     { onClick: handlerClick?()=>onRowClick(row, rowIndex): undefined },
            //     ()=>row.map(cell=> h(rowIndex==0?NTh:NTd, ()=>cell))
            // ))
            ()=> [
                h('thead', h(NTr,{}, ()=>data[0].map(cell=> h(NTh, ()=>cell)))),
                h('tbody', data.slice(1).map((row, rowIndex)=> h(
                    NTr,
                    { onClick: handlerClick?()=>onRowClick(row, rowIndex): undefined },
                    ()=>row.map(cell=> h(NTd, ()=>cell))
                )))
            ]
        )
    }

    const renderHTML = t=> h('div',{innerHTML: t})


    /**
     * 注册到全局 window 属性，方便其他页面使用
     */
    window.M = window.M || {
        loadingBar,
        alert (msg, title){
            return dialog.info({
                title,
                showIcon:false,
                content: UI.html(msg),
                positiveText: "朕知道了"
            })
        },
        ok (content){
            showMsg(content, "success")
        },
        info (content){
            showMsg(content, "info")
        },
        warn (content){
            showMsg(content, "warning")
        },
        error (content){
            showMsg(content, "error")
        },
        /**
         * 对 info、error、ok、warn 的封装
         * 如果需要定制更多，请直接使用 useNotification.create(options)
         */
        notice :{
            /**
             * 如果 ps 带有 type 属性（且是有效的值），则调用对应的通知类型
             * 否则直接调 create 方法
             */
            create (ps){
                if(ps.type && notification[ps.type])
                    notification[ps.type](ps)
                else
                    notification.create(ps)
            },
            info (content, title="提示", meta){
                showNotice(title, content, "info", meta, 5000)
            },
            ok (content, title="操作成功", meta){
                showNotice(title, content, "success", meta, 5000)
            },
            error (content, title="操作失败", meta){
                showNotice(title, content, "error", meta, null)
            },
            warn (content, title="警告", meta){
                showNotice(title, content, "warning", meta, 6000)
            }
        },
        confirm (title="操作确认", content, onOk, onCancel){
            return  dialog.warning({
                title,
                content,
                positiveText: "确定",
                negativeText: "我再想想",
                onPositiveClick: () => {
                    if (onOk) onOk()
                },
                onNegativeClick: () => {
                    if (onCancel) onCancel()
                }
            })
        },
        /**
         * 详见 https://www.naiveui.com/zh-CN/light/components/dialog#DialogOptions-Properties
         */
        dialog (ps={title:"操作确认", transformOrigin:"center"}){
            return dialog.create(ps)
        },
        /**
         * 显示错误信息
         */
        showError (msg, title="应用执行出错"){
            return dialog.create({
                type: 'error',
                style:{ width:"640px" },
                title,
                maskClosable: false,
                content: UI.html(msg)
            })
        },
        /**
         * 以对话框的形式展示数据
         *
         * 示例：
         * M.showData({'第一章':[["标题","世说新语解读"],['主讲人','张大师'],['时长','60分钟']],'第二章':[["标题","西游记新式解读"],['主讲人','李专家'],['时长','120分钟']]},{tabs:false, buttons:[{action:'excel'}]})
         *
         * @params data 若为数组则以表格展示；字符串则以 HTML 展示；Object 则以 Tabs 形式展示
         * @params ps   详见 https://www.naiveui.com/zh-CN/light/components/dialog#useDialog-API
         *              如果想要确认交互，请传递 {positiveText:"确认", onPositiveClick:()=>console.debug("点击了确认按钮")}
         *              buttons: [
         *                  { text:"内容", theme:"类型，默认为primary", action: 字符串 或者回调函数 ()=>{} }
         *              ]
         */
        showData (data, ps={}){
            ps = Object.assign(
                {
                    title:"数据展示",                //对话框标题
                    width: "800px",                 //对话框宽度
                    showIcon: true,                 //是否显示图标
                    transformOrigin:"center",       //弹框动画起源位置
                    onRowClick: undefined,          //表格行点击回调（仅针对二维数组）
                    pre:false,                      //原样展示文本内容（使用 pre 标签）
                    tabs: true,                     //展示 Map/Object 时使用 tabs 组件，设置为 false 时则采用瀑布式垂直展示
                },
                ps
            )
            let items = []
            if(Array.isArray(data) && Array.isArray(data[0])){
                items.push(renderTable(data, ps.onRowClick))
            }
            else if(typeof(data) === 'string'){
                items.push(ps.pre? h('pre', {class:"break", style:{'line-height':"100%"}}, data) : renderHTML(data))
            }
            else if(typeof(data) === 'object'){
                items.push(
                    ps.tabs === true?
                        h(NTabs, {}, ()=>Object.keys(data).map((title, index)=>h(
                            NTabPane,
                            {name: "DIALOG-TAB-"+index, tab:title},
                            Array.isArray(data[title])?
                                renderTable(data[title], ps.onRowClick)
                                :
                                renderHTML([title])
                        )))
                        :
                        h(NSpace, {vertical:true}, ()=> Object.keys(data).map((title, index)=>h(
                            NCard,
                            { title, size:"small" },
                            ()=>Array.isArray(data[title])?
                                renderTable(data[title], ps.onRowClick, {bordered:false, bottomBordered:false})
                                :
                                renderHTML([title])
                        )))
                )
            }
            else if(typeof data ==='function')
                items.push(data)

            if(Array.isArray(ps.buttons)){
                items.push(
                    h(
                        NSpace,
                        {class:"text-center mt-2", justify:"center"},
                        ()=> ps.buttons.map(btn=>{
                            let isExcel = btn.action==='excel'
                            if(isExcel && !btn.text) btn.text = "导出表格到 Excel"
                            return h(
                                NButton,
                                {
                                    type: btn.theme??"primary",
                                    onClick:()=> {
                                        if(isExcel){
                                            // 如果需要下载多个表格，可以通过 class="m-dialog-table" 获取并筛选
                                            let ele = document.querySelector(`#${_showDataTableId}`)
                                            if(!ele)    return M.error(`待导出的 Table 对象不存在`)

                                            H.excel.saveTable(ele, btn.params||`表格导出.xlsx`)
                                        }
                                        else if(typeof(btn.action)==='function')
                                            btn.action()
                                    }
                                },
                                ()=> btn.text
                            )
                        })
                    )
                )
            }
            ps.content = ()=> items
            ps.style = {width:ps.width, maxWidth:"100%"}
            return dialog.create(ps)
        },
        closeDialog (){
            dialog.destroyAll()
        },

        /**
         * 以对话框的形式打开一个功能页面
         *
         * @param {String} aid - 应用ID
         * @param {String} pid - 页面ID
         * @param {Object} params - 参数
         */
        openPage (aid, pid, params={}){
            H.app.prepare(aid, pid, params).then(({url, option})=>{
                console.debug(url, option)
                let style = {}
                let height = Math.min(!!option.height ? option.height : parseInt(window.innerHeight*0.8), window.innerHeight) - 80
                if(!!option.width)  style.width = `${Math.min(option.width, window.innerWidth)}px`

                style.height = `${height}px`
                style.padding = '10px 0px'

                console.debug(height)
                dialog.create({
                    type:"success",
                    showIcon: false,
                    class:'app-view-dialog',
                    style,
                    maskClosable: false,
                    content: ()=>h(IFrame, {url})
                })
            })
        },


        /**
         * 弹出输入框
         *
         * naive-ui 没有提供类似的工具，自行实现
         * 这里赞一下 https://layui.dev/docs/2.8/layer/#type
         *
         * @param {String}  tip 标题
         * @param {Object}  ps  配置项
         */
        prompt (title="请输入", ps={}) {
            ps = Object.assign({theme:'info', icon:false, type:'text'}, ps)
            return new Promise((ok)=>{
                let value = ps.value
                let onOk = ()=> {
                    if(value != null && (ps.type=='number' || !!value ))
                        ok(value)
                    else{
                        M.warn(`请输入内容`)
                        return false
                    }
                }
                let instance = dialog.create({
                    style: ps.style,
                    title,
                    bordered: false,
                    showIcon: ps.icon,
                    autoFocus:true,
                    maskClosable: false,
                    type: ps.theme,
                    positiveText: ps.okText || '确定',
                    negativeText: ps.cancelText || '取消',
                    content: ()=>[
                        h(ps.type=='number'? NInputNumber : NInput, {
                            defaultValue: value,
                            placeholder: ps.placeholder,
                            type: ps.type,
                            rows: ps.type=='textarea'?(ps.rows??5):1,
                            "on-update:value": v=> value = v,
                            "on-keyup": ({code})=> {
                                if(code === 'Enter'){
                                    onOk()
                                    instance.destroy()
                                }
                            }
                        }),
                        ps.message? h('div',{class:"mt-2"}, h(NText, {depth:3}, UI.html(ps.message))) : undefined
                    ],
                    onPositiveClick: onOk
                })
            })
        }
    }
</script>
