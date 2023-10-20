const schedule = require('node-schedule')

schedule.scheduleJob("*/10 * * * * ?", ()=> console.debug(Date.now()))

setTimeout(()=> process.exit(0), 60*1000)
