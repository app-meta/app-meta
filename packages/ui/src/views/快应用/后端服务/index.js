export const INSIDE = "inside"

export const deployModes = [
    { label:"平台部署", value: INSIDE, summary:"使用平台进行部署及进程管理（目前仅支持 nodes.js 开发语言）" },
    { label:"外部应用", value:"outside", summary:"应用已经部署，通过 URL 进行请求转发" }
]

export const languages = UI.buildOptions("node|Node.js,java|Java 归档（可执行）,exe|OS可执行程序")
