# 统计图表
> add on 2023-04-01

## 数据计算说明
> 挂件数据根据`origin`、`data`两个条件进行计算，前者表示计算方式（`const`=常量或者JSON数据，`func`=脚本代码，`url`=远程获取），后者表示具体值

### CONST / 常量或JSON数据

* 若挂件的数据类型为`纯文本`（如富文本展示、大字报）则直接返回原始的`data`
* 若`data`以`[ 或者 {`开头，则会被认为是 JSON 格式的数据，转换后返回
* 系统尝试对数据进行按行分割处理，并对每行进行如下处理：
    * 对于图表：按空格隔开转换为`{name, value}`对象
    * 对于表格：按空格隔开转换为数组

**示例**

```bash
# 输入内容
星期一 10
星期二 8
星期三 5

# 图表类型转换为
[
    {name:"星期一", value:"10"},
    {name:"星期二", value:"8"}
    {name:"星期三", value:"5"}
]

# 表格类型转换为
[
    ["星期一", "10"],
    ["星期二", "8"],
    ["星期三", "5"]
]
```

### FUNC / 脚本代码
> 代码仅支持标准 JavaScript，必须以 Promise 方式进行数据返回（调用 resolve 方法传递结果）

```js
// 默认传递 resolve、reject 两个参数
H.data.query({}).then(d=>{
    //查询数据，处理后
    let finalData = []
    resolve(finalData)
})
```

### URL / 远程地址
> 返回必须是包含（但不限于）`success`、`data`两个属性的 Object

## 关于图表
> 图表更新有两种方式：`update`（调用 chart.vue 组件的 update 方法）、`option`（完整的 echarts 配置，可以从官网配置后复制过来）

## 演示数据

```js
let demoList = ` return [
    ["姓名", "性别", "出生年月", "部门", "联系电话"],
    ["集成显卡", "男", "2023.04", "自由主义部", "18176300000"],
    ["集成显卡", "男", "2023.04", "自由主义部", "18176300001"],
    ["集成显卡", "男", "2023.04", "自由主义部", "18176300002"],
    ["集成显卡", "男", "2023.04", "自由主义部", "18176300003"],
    ["集成显卡", "男", "2023.04", "自由主义部", "18176300004"]
]
`

let items = [
    { col:2, widget:CHART, title:"测试饼状图", type:"pie", height:300, origin:"const", data:`{"星期一":10, "星期二":7, "星期三":5,"星期四":8,"星期五":13}` },
    { col:2, widget:CHART, title:"测试折线图", type:"line", height:300, origin:"const", data:`{"星期一":10, "星期二":7, "星期三":5,"星期四":8,"星期五":13}` },
    { col:2, widget:CHART, title:"测试柱状图", type:"bar", height:300, origin:"const", mode:"option",  data:`{"xAxis":{"type":"category", "data":["星期一","星期二","星期三","星期四","星期五"]},"yAxis":{"type":"value"},"series":[
        {"name":"迟到人数", "type":"bar", "data":[10,7,5,8,13]},
        {"name":"早退人数", "type":"bar", "data":[2,3,4,2,10]}
    ]}`},
    { col:6, widget:TABLE, title:"员工信息", origin:"func", data: demoList },
    { col:6, widget:TEXT, title:"报表说明", origin:"const", data: ">关于本报表\n\n上穷碧落下黄泉，两处茫茫皆不见" },
]
```
