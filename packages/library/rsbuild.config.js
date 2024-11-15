const path = require('path')
const { defineConfig } = require("@rsbuild/core")

const VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

/**
 * 2024-11-14 更新到 rsbuild，构建时间 0.8s（vite 为 6s）
 *
 * 下方是使用 rspack 的打包配置方案

const path = require('path')

/** @type {import('@rspack/cli').Configuration} *请删除/
module.exports = {
    mode: 'production',
    entry: './index.js',
    devtool:false,
    output: {
        library: 'H',
        libraryTarget: 'umd',
        globalObject: "this",
        path: path.resolve(__dirname, '..', 'ui/public'),
        filename: 'meta-helper.js'
    }
}

 */

module.exports = defineConfig({
    mode: 'production',
    source:{
        entry: { index: './index.js' },
        define:{
            "_VERSION_": JSON.stringify(VERSION)
        }
    },
    output:{
        target: 'node',
        legalComments: 'none',
        charset: 'ascii',
        cleanDistPath: false,
        distPath:{
            root: path.resolve(__dirname, '..', 'ui/public'),

        }
    },
    // 生成 UMD 格式的文件，还可以通过 @rsbuild/plugin-umd 达到同样的效果
    tools:{
        rspack:{
            output:{
                globalObject:"this",
                library:"H",
                libraryTarget: "umd",
                filename: 'meta-helper.js'
            }
        }
    }
})
