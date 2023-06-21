let code = `
let keyword = params.keyword.toLowerCase()
let texts = []
document.querySelectorAll(".headline,.tab-page").forEach(v=>{
    v.querySelectorAll("a").forEach(a=>{
        if(a.className.indexOf("title")>=0){
            let {text, href} = a
            if(text.toLowerCase().indexOf(keyword)>=0){
                texts.push(text)
                META.log("找到 ["+keyword+"] 的文章："+text)
            }
        }
    })
})

alert("数据获取完成")


META.notify("从开源中国（OSCHINA）首页咨询栏获取到关键字 "+keyword+" 相关文章 "+texts.length+" 篇，请查看日志获取详细的信息")
// META.data(texts)
META.finish("作业完成，共获取数据 "+texts.length+" 条")
// 或者使用 META.progress(100, "作业完成，共获取数据 "+texts.length+" 条")
`

module.exports = {
    page: { aid:"DEMO", id:"25", name:"演示 WEB-RPA （OSCHINA）" },
    bean: {
        url:"https://www.oschina.net",
        code,
        snapshot: true,
        merge: true
    },
    params: {keyword: "java"}
}
