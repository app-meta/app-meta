import { defineConfig, logger } from "@rsbuild/core"

let VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

/**
 * 2024-11-14 更新到 rsbuild，构建时间 0.7s（webpack 为 13s，启用缓存 0.65s）
 *
 * rspack 配置如下

import * as rspack from "@rspack/core"

const { BannerPlugin, DefinePlugin } = rspack.default

let VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

/** @type {import('@rspack/cli').Configuration} *删除/
export default {
    mode: 'production',
    entry: './index.js',
    target: 'node',
    devtool: false,
    output: {
        filename: 'meta-cli.cjs'
    },
    plugins:[
        // cli 程序需要注入一个首行内容
        new BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
        new DefinePlugin({
            "global._VERSION_": JSON.stringify(VERSION),
        })
    ]
}

 */

logger.greet(`即将通过 Rsbuild 打包（请手动注入 banner 信息）...`)
logger.level = 'error'

export default defineConfig({
    source:{
        entry:{ index: './index.js' },
        define: {
            "global._VERSION_": JSON.stringify(VERSION)
        }
    },
    output:{
        cleanDistPath: false,
        target: 'node',
        filename: { js: 'meta-cli.cjs' },
        legalComments: 'none'
    }
})
