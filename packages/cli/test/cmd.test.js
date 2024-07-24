import { Command } from 'commander'

const app = new Command()
app
    .name("meta")
    .description("CLI to app-meta platform, enjoy ^.^")
    .version(`dev`)

app.command("test")
    .description("检测联通性（返回服务器时间）")

const page = app.command("page").description("页面功能（新建、部署等）")

page.command("deploy")
    .alias("d")
    .description("部署功能（小程序或后端服务）")
    .option("-a, --aid <string>", "关联应用ID")
    .option("-p, --pid <string>", "关联页面/功能ID")
    .action(()=>{
        console.debug("-------------", this)
    })

page.command("create")
    .alias("c")
    .description("创建新页面/功能")
    .option("-n, --name <string>", "功能名称")
    .option("-t, --template <string>", "功能类型", "h5")
    .action(opts=> console.debug(`CREATE PAGE, tempalte=${opts.template} name=${opts.name}`))

app.parse(process.argv)
