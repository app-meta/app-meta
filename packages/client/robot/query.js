let code = `
let keyword = params.keyword.toLowerCase()
let texts = []

function deal(a, origin=""){
    let {text, href} = a
    if(text.toLowerCase().indexOf(keyword)>=0){
        texts.push(text)
        META.log("从【"+origin+"】中找到 ["+keyword+"] 的文章："+text)
    }
}

function oschina(){
    document.querySelectorAll(".headline,.tab-page").forEach(v=>{
        v.querySelectorAll("a").forEach(a=>{
            if(a.className.indexOf("title")>=0) deal(a, "开源中国")
        })
    })

    META.log("OSCHINA 处理完成，即将跳转到 CSDN...")
    META.cache('oschina', texts)
    location.href = "https://www.csdn.net/"
}

function csdn(){
    document.querySelectorAll(".headswiper-content").forEach(v=>{
        console.debug(v)
        v.querySelectorAll("a").forEach(a=>{
            if(a.className.indexOf("title")>=0) deal(a, "CSDN")
        })
    })

    META.log("CSDN 处理完成，即将跳转到 InfoQ...")
    META.cache('csdn', texts)
    location.href = "https://www.infoq.cn/"
}

function infoQ(){
    [...document.querySelectorAll(".item-info a"), ...document.querySelectorAll(".article-list .item-main .info h6 a")].forEach(a=> deal(a, "InfoQ"))

    done()
}

function done(){
    Object.keys(caches).forEach(k=> texts.push(...caches[k]))
    META.notify("从多平台首页咨询栏获取到关键字 "+keyword+" 相关文章 "+texts.length+" 篇，请查看日志获取详细的信息")
    META.data(texts)
    META.progress(100, "作业完成，共获取数据 "+texts.length+" 条")
}

if(location.href.indexOf("csdn.net")>=0)            csdn()
else if(location.href.indexOf("oschina.net")>=0)    oschina()
else if(location.href.indexOf("infoq.cn")>=0)       infoQ()
`

module.exports = {
    page: { aid:"DEMO", id:"1", name:"多平台（CSDN、开源中国、InfoQ）文章检索工具" },
    bean: {
        url:"https://www.oschina.net",
        code,
        snapshot: true,
        merge: true
    },
    params: {keyword: "java"}
}
