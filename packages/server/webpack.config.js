const pkg = require("./package.json")
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: './fastify.js',
    target: 'node',
    output: {
        // 默认保存到 dist 目录下
        // path: path.resolve(__dirname, '..', 'ui/public'),
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
