import { ref } from 'vue'

const TABLE = "history"
const prefix= ()=> `${window.User?.id}.`

export const useHistory = ()=>{
    const clearHistory = ()=>{
        let P = prefix()
        H.db.stream(TABLE, row=>{
            if(row.dbId.startsWith(P)){
                H.db.remove(TABLE, row.dbId).then(()=> Config.isDev && H.log.debug(`删除浏览记录 ${row.dbId}/${row.name}`))
            }
        })
    }

    const getHistoryList = (max=20)=>new Promise(ok=>{
        let list = []
        let P = prefix()
        H.db.stream(TABLE, row=> row.dbId.startsWith(P) && list.push(row))
            .then(v=> ok(list))
    })

    const saveHistory = p =>{
        let data = {dbId:`${prefix()}${p.id}`, id: p.id, aid:p.aid, name:p.name, template:p.template, launch:p.launch, updateOn:p.updateOn, date:Date.now()}
        H.db.insert(TABLE,data).then(v=>Config.isDev && H.log.debug(`保存访问记录`, data))
    }

    return { clearHistory, getHistoryList, saveHistory }
}
