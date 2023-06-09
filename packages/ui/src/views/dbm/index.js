const NUM_TYPES = ['tinyint', 'smallint', 'mediumint', 'int', 'integer', 'bigint', 'float', 'double', 'decimal']

export const MYSQL = "mysql"

/**
 *
 * @returns
 */
export const createSource = ()=>({name:"新建数据源", type: MYSQL, host:"localhost", port: 3306, username:"root"})

export const types = UI.buildOptions([MYSQL])

export const loadItems = (sourceId, db="")=> new Promise((ok)=> RESULT("/dbm/items", {sourceId, db}, d=> ok(d.data)))

/**
 * 按 SQL 类型判断控件类型
 * @param {*} type
 */
export const detectForm = (type, value)=>{
    if(type == 'text')  return 'textarea'
    if(type == 'tinyint(1)') return 'switch'

    if(typeof(value) == 'number')   return 'number'
    if(typeof(value) == 'string')   return 'text'

    if(type.indexOf("(")>0)
        type = type.substring(0, type.indexOf("("))

    if(NUM_TYPES.includes(type))    return 'number'
    return 'text'
}

export const actionTypes = ()=> UI.buildOptions("SQL,C|CREATE,R|READ,U|UPDATE,D|DELETE")
