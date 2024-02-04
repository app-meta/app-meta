import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: '../ui/public',
        lib:{
            entry: './index.js',
            name: 'H',
            formats: ['umd'],
            fileName: ()=> `meta-helper.js`
        }
    },
    // 解决产物编码问题
    esbuild:{
        charset:'ascii'
    }
})
