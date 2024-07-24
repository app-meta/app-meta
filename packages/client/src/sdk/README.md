# 主进程与渲染进程的交互 API

交互 API 分为主窗口交互（mainWindow）、应用窗口（运行应用的临时窗口）。

目录结构：

- README.md         模块介绍
- index.js          通用 API （主窗口、任务窗口均通用）
- sdk.app.js        应用运行窗口专用（但不限制主窗口的使用）
- sdk.main.js       只能在主窗口使用的 API （通过 `id` 限制）
