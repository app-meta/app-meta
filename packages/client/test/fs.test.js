const { readFileSync } = require("fs")

console.debug(readFileSync("C:/Users/admin/Downloads/webp.png", {encoding:'base64'}))

console.debug(readFileSync("C:/Users/admin/Downloads/webp.png", {encoding:'binary'}))

console.debug(readFileSync("C:/Users/admin/Downloads/test.txt", {encoding:'utf-8'}))
console.debug(readFileSync("C:/Users/admin/Downloads/test.txt", {encoding:undefined}))
