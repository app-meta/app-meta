<template></template>
<script setup>
    import { ref, h } from 'vue'
    import { useMessage, useNotification, useDialog,NButton, NText, NInput, NInputNumber, useLoadingBar, NTable, NTr, NTd, NTh, NTabs, NTabPane } from "naive-ui"

    const notification  = useNotification()
    const message       = useMessage()
    const dialog        = useDialog()
    const loadingBar    = useLoadingBar()

    let showNotice = (title, content, type="info", meta, duration=5000)=> notification[type]({title, content,meta, duration})
    let showMsg = (content, type="info")=> message[type](content)

    /**
     *
     * @params filename 若设置则视为支持导出（以此为文件名）
     */
    const renderTable = (data, filename, onRowClick)=> ()=> {
        let id = `TABLE${Math.floor(Math.random()*1000)}`
        let handlerClick =  onRowClick && typeof(onRowClick)=='function'
        let items = [
            h(
                NTable,
                {size:"small", striped:true, id},
                ()=> data.map((row, rowIndex)=> h(
                    NTr,
                    { onClick: handlerClick?()=>onRowClick(row, rowIndex): undefined },
                    ()=>row.map(cell=> h(rowIndex==0?NTh:NTd, ()=>cell))
                ))
            )
        ]
        if(!!filename) {
            items.push(
                h('div', {class:"text-center mt-2"}, h(
                    NButton,
                    {
                        size:"small", type:"primary", secondary:true,
                        onClick:()=> {
                            let ele = document.querySelector(`#${id}`)
                            if(!ele)    return M.error(`待导出的 Table 对象不存在`)

                            H.excel.saveTable(ele, filename)
                        }
                    },
                    ()=>"导出表格到Excel"
                ))
            )
        }
        return items
    }

    /**
     * 注册到全局 window 属性，方便其他页面使用
     */
    window.M = window.M || {
        loadingBar,
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
                showNotice(title, content, "error", meta, undefined)
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
                content: UI.html(msg)
            })
        },
        /**
         * 以对话框的形式展示数据
         *
         * @params data 若为数组则以表格展示；字符串则以 HTML 展示；Object 则以 Tabs 形式展示
         * @params ps   详见 https://www.naiveui.com/zh-CN/light/components/dialog#useDialog-API
         *              如果想要确认交互，请传递 {positiveText:"确认", onPositiveClick:()=>console.debug("点击了确认按钮")}
         */
        showData (data, ps={}){
            ps = Object.assign({title:"数据展示", width: "800px", showIcon: true, transformOrigin:"center", onRowClick: undefined, pre:false}, ps)
            if(Array.isArray(data) && Array.isArray(data[0])){
                ps.content = renderTable(data, ps.filename, ps.onRowClick)
            }
            else if(typeof(data) === 'string'){
                ps.content = ps.pre? ()=>h('pre', {class:"break", style:{'line-height':"100%"}}, data) : UI.html(data)
            }
            else if(typeof(data) === 'object'){
                ps.content = ()=>h(
                    NTabs,
                    {},
                    ()=>Object.keys(data).map((title, index)=>h(
                        NTabPane,
                        {name: "DIALOG-TAB-"+index, tab:title},
                        Array.isArray(data[title])?
                            renderTable(data[title], ps.filename, ps.onRowClick)
                            :
                            UI.html(data[title])
                    ))
                )
            }
            else if(typeof data ==='function')
                ps.content = data

            ps.style = {width:ps.width, maxWidth:"100%"}
            return dialog.create(ps)
        },
        closeDialog (){
            dialog.destroyAll()
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
                dialog.create({
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
                        }),
                        ps.message? h('div',{class:"mt-2"}, h(NText, {depth:3}, UI.html(ps.message))) : undefined
                    ],
                    onPositiveClick: ()=> ok(value)
                })
            })
        }
    }
</script>
