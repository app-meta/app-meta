import Table from 'cli-table3'

const name = "集成显卡"
const age = 666
const phone = "18000000000"
const address = "中国广西南宁市良庆区宋厢路1号"

const style = { 'padding-left': 0, 'padding-right': 0, head:[] }

let table = new Table({
    head: ["姓名", "年龄", "手机号", "联系地址"],
    style,
    chars: {'mid': '-', 'left-mid': '|', 'mid-mid': '', 'right-mid': ''},
    wordWrap: true
})

table.push([name, age, phone, address])

console.debug(table.toString())

table = new Table({style})
// table.push(
//     { name, age, phone, address },
//     { name, age, phone, address }
// )
table.push(
    { 'Some key': 'Some value' }
  , { 'Another key': 'Another value' },
    {"第三列":"sasa"}
);
console.debug(table.toString())

table = new Table({ head: ["", "Top Header 1", "Top Header 2"] });

table.push(
    { 'Left Header 1': ['Value Row 1 Col 1', 'Value Row 1 Col 2'] }
  , { 'Left Header 2': ['Value Row 2 Col 1', 'Value Row 2 Col 2'] }
);

console.log(table.toString());
