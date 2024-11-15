import fs from 'fs'
import chalk from 'chalk'

const path = "dist/meta-cli2.cjs"
const banner = `#!/usr/bin/env node\n`

if(!fs.existsSync(path)){
    console.info(chalk.red(`文件 ${path} 不存在`))
    process.exit(0)
}

let content = fs.readFileSync(path, "utf8")

// 在文件顶部添加 Banner
fs.writeFileSync(path, banner + content, "utf8")

console.log(chalk.cyan("Banner 添加完成 ^.^"))
