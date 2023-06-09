const path = require('path')
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: './index.js',
    output: {
        library: 'H',
        libraryTarget: 'umd',
        globalObject: "this",
        path: path.resolve(__dirname, '..', 'ui/public'),
        filename: 'meta-helper.js'
    },
    cache:{
        type: 'filesystem'
    },
    performance:{
        // 关闭提示
        hints:false
    },
    optimization:{
        minimize: true,
        minimizer: [
            new TerserPlugin({
                // 不提取注释到单独的文件
                extractComments: false
            })
        ],
    }
}
