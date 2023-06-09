const { resolve } = require("path");
const { loadScript } = require("../src/common/tool");

loadScript(resolve(__dirname, "../src/sdk/module")).forEach(v=>console.debug(v))
