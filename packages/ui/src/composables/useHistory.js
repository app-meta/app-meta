import { ref } from 'vue'

const TABLE = "history"

export const useHistory = ()=>{
    const PREFIX = `${User.id}.`
    const clearHistory = ()=>{
        H.db.stream(TABLE, row=>{
            if(row.dbId.startsWith(PREFIX)){
                H.db.remove(TABLE, row.dbId).then(()=> Config.isDev && H.log.debug(`删除浏览记录 ${row.dbId}/${row.name}`))
            }
        })
    }

    const getHistoryList = (max=20)=>new Promise(ok=>{
        let list = []
        H.db.stream(TABLE, row=> row.dbId.startsWith(PREFIX) && list.push(row))
            .then(v=> ok(list))
    })

    const saveHistory = p =>{
        let data = {dbId:`${PREFIX}${p.id}`, id: p.id, aid:p.aid, name:p.name, template:p.template, launch:p.launch, updateOn:p.updateOn, date:Date.now()}
        H.db.insert(TABLE,data).then(v=>Config.isDev && H.log.debug(`保存访问记录`, data))
    }

    return { clearHistory, getHistoryList, saveHistory }
}
