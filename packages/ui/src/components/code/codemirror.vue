<!--
    代码编辑器
    更多配置请参考 https://github.com/surmon-china/vue-codemirror
-->
<template>
    <div :style="{ height, width:'100%'}">
        <!-- :style="{ height }" -->
        <Codemirror
            v-model="code"
            theme="amy"
            :indentWithTab="false"
            :placeholder="placeholder"
            :autofocus="autofocus"
            :indent-with-tab="true"
            :tab-size="tabSize"
            :disabled="readOnly"
            :extensions="extensions"
            @change="v=>emits('update:value', v)"
        />
    </div>
</template>

<script setup>
    import { ref,onMounted, watch } from 'vue'


    import { keymap} from "@codemirror/view"
    import { Prec, EditorState } from "@codemirror/state";
    import { Codemirror } from 'vue-codemirror'
    import { javascript } from '@codemirror/lang-javascript'
    import { html } from '@codemirror/lang-html'
    import { sql } from '@codemirror/lang-sql'
    import { vue } from '@codemirror/lang-vue'
    import { oneDark } from '@codemirror/theme-one-dark'
    import { autocompletion, completeFromList, snippetCompletion as snip } from "@codemirror/autocomplete"

    // 更多主题 https://github.com/vadimdemedes/thememirror
    // import {dracula} from 'thememirror'

    const emits = defineEmits(['update:value'])
    const props = defineProps({
        value:{type:String, default:""},
        readOnly:{type:Boolean, default:false},
        autofocus: {type:Boolean, default:false},
        tabSize:{type:Number, default:4},
        height: {type:String, default:"300px"},
        placeholder:{type:String, default:"请输入代码"},
        language:{type:String, default:"js"},
        keyBinds:{type:Array, default:[]}
    })

    const detail = "META"
    const type = 'function'
    const jsLang = javascript()

    const extensions = []

    if(props.language == 'html')        extensions.push(html())
    else if(props.language == 'sql')    extensions.push(sql())
    else if(props.language == 'vue')    extensions.push(vue())
    else                                extensions.push(jsLang)

    if(props.language != 'sql'){
        //添加自定义提示，如果直接使用 autocompletion，会覆盖原有的 JS 代码提示，需要手动加上
        extensions.push(autocompletion({
            override: [
                jsLang.extension[1][0].value.autocomplete,
                completeFromList([
                    snip("H.data.insert({aid:'${}'},{${}})", {label:"H.data.insert", detail, type, info:"插入数据"}),
                    snip("H.data.query({aid:'${}', match:[${}]}).then(d=>{${}})", {label:"H.data.query", detail, type, info:"检索数据"}),
                    snip("H.data.setBlock('${aid}','${uuid}','${}')", {label:"H.data.setBlock", detail, type, info:"更新数据块"}),
                    snip("H.data.getBlock('${aid}','${uuid}')", {label:"H.data.getBlock", detail, type, info:"获取数据块内容"}),

                    snip("H.service.json('${aid}', '${url}', {${}}).then(d=>{${}})", {label:"H.service.json", detail, type, info:"调用后端服务"}),
                    snip("H.service.json(null, ${pid}, {${}}).then(d=>{${}})", {label:"FaaS接口", detail, type, info:"调用 FaaS"}),
                    snip("H.app.runPage('${aid}','${pid}', true)", {label:"H.app.runPage", detail, type, info:"在新窗口打开功能页面"}),

                    snip("M.showData(${},{title:'${}', width: '800px'})", {label:"H.showData", detail, type, info:"以对话框形式展示数据"}),
                    snip("M.ok(`${}`)", {label:"M.ok", detail, type, info:"弹出成功消息"}),
                    snip("H.notice.ok(`${}`)", {label:"M.notice.ok", detail, type, info:"在右上角弹出成功提示框"}),
                    snip("UI.buildOptions(`${}`)", {label:"UI.buildOptions", detail, type, info:"转换为下拉框列表"}),
                    snip("H.debug(`${}`)", {label:"debug", detail, type, info:"打印DEBUG日志（带时间）"}),

                    snip("console.debug(`${}`)", {label:"console.debug", type, info:"打印DEBUG日志"}),
                ])
            ]
        }))
    }

    if(window.DARD == true)             extensions.push(oneDark)

    /**
     * 注册自定义按键
     * https://github.com/surmon-china/vue-codemirror/issues/150
     *
     * 传递 {key，handler}，如果 handler 为空则默认屏蔽该快捷键
     */
    if(props.keyBinds.length>0){
        props.keyBinds.forEach(({key, handler })=> {
            extensions.push(
                Prec.high(
                    keymap.of([{key, run: handler?? (()=>true) }])
                )
            )
            if(window.Config?.isDev===true) console.debug(`[CODE-MIRROR] 注册快捷键 ${key}：${handler==null?"未传递处理函数（即屏蔽默认行为）":"自定义处理函数"}`)
        })
    }
    extensions.push(Prec.high(keymap.of([{key:'Ctrl-Y', run:'deleteLine'}])))

    let code = ref(props.value)

    watch(()=>props.value, ()=> code.value=props.value)

    onMounted(() => {
    })
</script>
