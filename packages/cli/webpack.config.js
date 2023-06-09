import webpack from "webpack"

let VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

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
    performance:{
        // 关闭提示
        hints:false
    }
}
