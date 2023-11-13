const path = require('path')
const TerserPlugin = require("terser-webpack-plugin");

/** @type {import('@rspack/cli').Configuration} */
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
