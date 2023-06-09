import { formValueProvider, lifeCycles } from "@grid-form/common"

/*
扩展默认的表单默认值计算器
支持 Promise （未作异常捕获，慎用）
*/
formValueProvider["${date}"]            = ()=> H.date.date()
formValueProvider["${yesterday}"]       = ()=> H.date.addDay(-1)
formValueProvider["${month}"]           = ()=> H.date.date(Date(), "YYYY-MM")
formValueProvider["${monthBegin}"]      = ()=> H.date.beginOf()
formValueProvider["${monthEnd}"]        = ()=> H.date.endOf()
formValueProvider["${lastMonthBegin}"]  = ()=> H.date.addDay(-1, H.date.beginOf(), 'month')
formValueProvider["${lastMonthEnd}"]    = ()=> H.date.addDay(-1, H.date.endOf(), 'month')
formValueProvider["${yearBegin}"]       = ()=> H.date.beginOf('year')
formValueProvider["${yearEnd}"]         = ()=> H.date.endOf('year')
