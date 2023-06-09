console.group(`环境变量`)

let keys = ["NODE_ENV","HOME_PAGE"]
keys.forEach(key=> console.debug(`${key} = ${process.env[key]}`))
console.groupEnd()
