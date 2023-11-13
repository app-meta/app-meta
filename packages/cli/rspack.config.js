import { BannerPlugin, DefinePlugin } from "@rspack/core"

let VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

/** @type {import('@rspack/cli').Configuration} */
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
