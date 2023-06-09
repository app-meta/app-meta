# 问卷调查
> 支持分组、单选、多选、填空等题目配置

## 数据结构
> 数据保存到`data`

### 问卷

字段名|中文名|类型|默认值|说明
-|-|-|-|-
anonymous|是否匿名|boolean|false|若设置为 true 则不记录填卷人信息
time|开放时段|String||问卷开放时间段（可以设置时间）
summary|说明信息|String||MARKDOWN 格式（显示在问卷头部）
items|题目|Array|[]|题目，包含以下属性
`title`|标题|String||
`type`|类型|int|0|0=单选题，1=多选题，2=填空题
`min`|最小选择|int|0|`仅对多选有效`
`max`|最大选择|int|0|`仅对多选有效`
`options`|选项|String/Array|[]|选项值
`required`|是否必填|boolean|false|
`abbr`|题目简称|String||用于结果显示

### 填报结果

字段名|中文名|类型|默认值|说明
-|-|-|-|-
user|用户名|String||
used|用时|int|0|从用户打开问卷到提交的耗时，单位秒
date|提交日期|String||
`问题1-N`|问题|String||所有问题的答案，如果没有设置`问题简称`则取题目序号（如`Q1`）
