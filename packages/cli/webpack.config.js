import webpack from "webpack"

let VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

/**
 * 目前使用 vite 无法正常打包node应用，故还是使用 webpack 😔
 * 可以考虑使用 unbuild
 */
export default {
    mode: 'production',
    entry: './index.js',
    target: 'node',
    output: {
        filename: 'meta-cli.cjs'
    },
    cache:{
        type: 'filesystem'
    },
    plugins:[
        // cli 程序需要注入一个首行内容
        new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
        new webpack.DefinePlugin({
            "global._VERSION_": JSON.stringify(VERSION),
        })
    ],
    externals: {
        "bufferutil": "bufferutil",
        "utf-8-validate": "utf-8-validate",
    },
    performance:{
        // 关闭提示
        hints:false
    }
}
