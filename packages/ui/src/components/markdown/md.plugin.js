// UML 插件（需要联网，暂不使用）
// import uml from '@toast-ui/editor-plugin-uml'

// COLOR 文本插件
import 'tui-color-picker/dist/tui-color-picker.min.css'
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css'
import colorSyntax from '@toast-ui/editor-plugin-color-syntax'

// 单元格合并插件
import '@toast-ui/editor-plugin-table-merged-cell/dist/toastui-editor-plugin-table-merged-cell.css'
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell'

export const plugins = [colorSyntax, tableMergedCell]

export const pluginsForViewer = [tableMergedCell]
