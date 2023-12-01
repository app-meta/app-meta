/*
 * @Author: 集成显卡
 * @Date: 2023-03-09 10:31:41
 * @Last Modified by:   集成显卡
 *
 * https://docs.sheetjs.com/docs/api/utilities
 *
 * 本模块打包后，约450KB
 */

import { read, utils, writeFile } from 'xlsx'

/**
 *
 * @param {*} file
 * @param {*} index
 * @param {*} opts 详见 https://docs.sheetjs.com/docs/api/utilities#array-output
 * @returns
 */
export const readToJSON = (file, index=-1, opts={})=> new Promise((ok, fail)=>{
    opts = Object.assign({dateNF: 'yyyy-mm-dd', raw:false}, opts)
    let reader = new FileReader()
    reader.readAsBinaryString(file)
    reader.onload = e=>{
        const wb  = read(e.target.result, {type:"binary"})
        if(index === -1){
            ok(wb.SheetNames.map(name=>({name, rows: utils.sheet_to_json(wb.Sheets[name], opts)})))
        }
        else if(index >= 0 && index < wb.SheetNames.length){
            ok(utils.sheet_to_json(wb.Sheets[wb.SheetNames[index]], opts))
        }
        else
            throw Error(`Sheet下标错误（应填写 -1 或者 [0, ${wb.SheetNames.length}) 之间的数值`)
    }
})

/**
 * 将 JSON/二维数组 数据写入到 Excel 中
 * 参考 https://docs.sheetjs.com/docs/getting-started/example
 * @param {*} rows
 * @param {*} ps    可设置 filename（文件名）、sheetName（表名）、compression（是否压缩）以及 options（详见 https://docs.sheetjs.com/docs/api/utilities）
 */
export const save = (rows, ps={})=>{
    if(!rows)   throw Error(`参数 rows 不能为空`)

    let cells = Array.isArray(rows)? rows:[ rows ]
    ps = Object.assign({filename:"数据导出.xlsx", sheetName:"", compression: false}, ps)

    let wb = utils.book_new()
    utils.book_append_sheet(
        wb,
        Array.isArray(cells[0])?utils.aoa_to_sheet(cells, ps): utils.json_to_sheet(cells, ps),
        ps.sheetName
    )
    writeFile(wb, ps.filename, {compression: ps.compression})
}

/**
 * 详见 https://docs.sheetjs.com/docs/api/utilities/#html-table-input
 * @param {*} tableEle
 * @param {*} filename
 */
export const saveTable = (tableEle, filename="表格导出.xlsx")=>{
    let eles = Array.isArray(tableEle)? tableEle:[ tableEle ]

    let wb = utils.book_new()
    eles.forEach(el=>{
        utils.book_append_sheet(wb, utils.table_to_sheet(el, { display:true }))
    })
    //导出
    writeFile(wb, filename)
}
