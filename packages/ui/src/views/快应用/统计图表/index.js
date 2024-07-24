import { ref, onMounted, watch } from 'vue'

import { runScript } from "@S/Runner"

export const CONST = "const"
export const FUNC  = "func"
export const URL   = "url"

export const CHART  = "chart"
export const TABLE  = "table"
export const TEXT   = "text"
export const PIN    = "pin"

const PLAIN_TEXTS   = [TEXT, PIN]
const SPLIT         = " "

export const track = (...ps)=> console.debug(`%c[统计图表]`, "background:#8c0776;padding:3px;color:white", ...ps)

/**
 *
 * @param {*} category  视图类型
 * @param {*} origin    数据来源
 * @param {*} data      数据
 */
export const loadData = (props, hook) => {
    let content   = ref()
    let loading = ref(true)
    let updateHook = typeof(hook) === 'function'? hook:undefined

    const onData = final=>{
        content.value = final
        loading.value = false

        if(updateHook)  updateHook(final)
    }

    const computeData = () =>{
        loading.value = true
        // 对于常量，支持 JSON 格式（[ 或者 { 开头）、纯文本（一行一个数据，用空格隔开名称与数值）
        if(props.origin == CONST){
            if(PLAIN_TEXTS.includes(props.widget))  return onData(props.data)
            // /^[\[{].*[\]}]$
            if(/^[\[{].*/.test(props.data)){
                try{
                    let json = JSON.parse(props.data)
                    return onData(json)
                }
                catch(e){
                    props.debug && track(`转换 JSON 格式出错，尝试进行 JS 转换...`)
                    let jsObj = runScript(`return ${props.data}`)
                    return onData(jsObj)
                }

            }

            onData(
                props.widget == CHART?
                    props.data.split("\n").map(v=>{
                        let tt = v.split(SPLIT)
                        return {"name":tt[0], value:tt[1]}
                    })
                    :
                    props.data.split("\n").map(v=> v.trim().split(SPLIT) )
            )
        }
        else if(props.origin == FUNC){
            runScript(props.data, {}, true).then(onData).catch(UI.showError)
        }
        else if(props.origin == URL){
            RESULT(props.data, {}, d=> onData(d.data))
        }
        else {
            throw Error(`未知的数据来源⌈${props.origin}⌋（可选值：${CONST}, ${FUNC}, ${URL}）`)
        }
    }

    onMounted( computeData )

    if(props.debug === true){
        watch(()=>[props.data, props.origin], ()=>{
            track(`监听到 ${props.widget}/${props.title} 的内容发生变化...`)
            computeData()
        })
    }

    return { loading, content }
}

// export const itemProps = {
//     col:{type:Number, default:2},
//     title:{type:String},
//     height:{type: Number, default: 320},
//     widget:{type:String, default:CHART},
//     type:{type:String, default: "line"},
//     origin:{type:String, default:CONST},              //数据来源，const=常量，func=函数代码，url=远程地址
//     data:{type:String, default:""},
//     mode:{type:String},
//     suffix:{type:String},
//     theme:{type:String, default:""},
//     debug:{type:Boolean, default:false}
// }
export const widgetProps = (extra={})=> Object.assign({
        col:    {type:Number, default:2},
        title:  {type:String},
        height: {type: Number, default: 320},
        widget: {type:String, default:CHART},
        origin: {type:String, default:CONST},              //数据来源，const=常量，func=函数代码，url=远程地址
        data:   {type:String, default:""},
        debug:  {type:Boolean, default:false}
    },
    extra
)

export const colSpan = 6
