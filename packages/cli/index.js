import { Command } from "commander"
import chalk from "chalk"

import { appName, VERBOSE } from "./core/base.js"
import { stopLoading } from "./core/util.js"

import common from "./module/common.js"
import other from "./module/other.js"
import application from "./module/app.js"
import page from "./module/page.js"
import system from "./module/system.js"
import dbm from "./module/dbm.js"
import service from "./module/service.js"
import openapi from "./module/openapi.js"
import data from "./module/data.js"

const app = new Command()

common(app)
application(app)
page(app)
data(app)
service(app)
dbm(app)
openapi(app)
other(app)
system(app)

app
    .name(appName)
    .description("CLI to app-meta platform, enjoy ^.^")
    .version(global._VERSION_ || "dev")
    .option('--verbose', '打印详细错误信息')
    .parseAsync(process.argv).catch(e=> {
        stopLoading(`${chalk.red("ERROR:")} ${e.message??e}`, false)

        if(app.getOptionValue(VERBOSE) === true)
            console.error("----------------------- 详细信息 -----------------------\n", e)
    })
