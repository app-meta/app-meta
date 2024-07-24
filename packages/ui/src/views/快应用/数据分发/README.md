# 数据分发
> 管理员上传数据表格，系统按照设定的列（用户ID）对登录用户展示归属 TA 的数据行

## 字段

id|名称|类型|说明
-|-|-|-
label|字段名称|String|数据展示时显示值
column|数据列名|String|导数时标题列值
query|参与检索|Boolean|勾选后用户可对此字段进行模糊查询
bindUid|绑定用户ID|Boolean|勾选后该字段将限定为当前登录用户ID
