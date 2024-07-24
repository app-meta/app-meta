//https://imzbf.github.io/md-editor-v3/zh-CN/demo#%F0%9F%99%8D%F0%9F%8F%BB%E2%80%8D%E2%99%82%EF%B8%8F%20%E8%87%AA%E8%A1%8C%E5%BC%95%E5%85%A5%E6%89%A9%E5%B1%95%E5%BA%93
/**
 * 增加依赖，避免内网 CDN 依赖加载不了
 *
 * pnpm -F ui i screenfull katex cropperjs prettier
 */

import { config } from 'md-editor-v3'

import screenfull from 'screenfull'

import katex from 'katex'
import 'katex/dist/katex.min.css'

import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

import mermaid from 'mermaid'

import highlight from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import 'highlight.js/styles/atom-one-light.css'

import './fix.css'

// >=3.0
// import * as prettier from 'prettier'
// import parserMarkdown from 'prettier/plugins/markdown'

// https://at.alicdn.com/t/c/font_2605852_u82y61ve02.js
import '@/assets/iconfont.js'

config({
    editorExtensions: {
        prettier: {
            prettierInstance: {}, //prettier
            parserMarkdownInstance: {} //parserMarkdown
        },
        highlight: {
            instance: highlight
        },
        screenfull: {
            instance: screenfull
        },
        katex: {
            instance: katex
        },
        cropper: {
            instance: Cropper
        },
        mermaid: {
            instance: mermaid
        }
    }
})


export const mdHeadingId =  (text, level, index)=>`H${index}`

export const previewTheme = "github"

export const showCodeRowNumber = true

export const toolbars = [
    'bold',
    'underline',
    'italic',
    '-',
    'strikeThrough',
    'title',
    'sub',
    'sup',
    'quote',
    'unorderedList',
    'orderedList',
    'task',
    '-',
    'codeRow',
    'code',
    'link',
    'image',
    'table',
    'mermaid',
    'katex',
    0,
    '-',
    'revoke',
    'next',
    // 'save',
    '-',
    // 'pageFullscreen',
    'fullscreen',
    'preview',
    'previewOnly',
    // 'htmlPreview',
    'catalog',
    // 'github'
]
