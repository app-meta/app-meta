const path = require('path')

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
