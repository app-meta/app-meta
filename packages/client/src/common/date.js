const dayjs = require("dayjs")

const YMD = "YYYY-MM-DD"
const HMS = "HH:mm:ss"

let date        = (d=new Date(),formater=YMD)=>dayjs(d).format(formater)
let time        = (d=new Date())=>dayjs(d).format(HMS)
let datetime    = (d=new Date())=>dayjs(d).format(`${YMD} ${HMS}`)
let addDay      = (step=1, d, key="day")=>dayjs(d).add(step, key).format(YMD)

module.exports ={
    date,
    time,
    datetime,
    hour (){
        return new Date().getHours()
    },
    addDay,
    compact (fmt="YYMMDDHHmmss"){
        return date(new Date, fmt)
    },
    compactTime (){
        return date(new Date, "HHmmss")
    },
    /**
     * 获取时间点开始日期
     * @param {*} key
     * @returns
     */
    beginOf (key="month"){
        return dayjs().startOf(key).format(YMD)
    },
    endOf (key="month"){
        return dayjs().endOf(key).format(YMD)
    }
}
