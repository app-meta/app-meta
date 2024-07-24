import confirm from '@inquirer/confirm'
import checkbox from '@inquirer/checkbox'
import select from '@inquirer/select'
import input from '@inquirer/input'

export const INPUT      = "input"
export const CHECKBOX   = "checkbox"
export const SELECT     = "select"
export const CONFIRM    = "confirm"
export const required   = true

/**
 * 控制台输入信息转换为 Object
 * @param {Array<PropertyItem>} properties
 */
export const inputToObject = async properties=>{
    let bean = {}
    for (const item of properties) {
        let args = {message: item.msg, default: item.default, validate: item.validate}
        if(item.form == SELECT || item.form == CHECKBOX)    args[choices] = item.options.map(value=>({value}))

        bean[item.key] = await (item.form==SELECT?select:item.form==CHECKBOX?checkbox:item.form==CONFIRM?confirm:input)(args)
        if(item.required === true && !bean[item.key]){
            throw `<${item.msg}>不能为空`
        }
    }
    return bean
}
