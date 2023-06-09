const notifier = require('node-notifier')
const path = require('path')
const os = require("os")

console.debug(os.release())

notifier.notify(
    {
        appID: "APP-META",
        title: '来自 Node.js 的通知',
        message: '上穷碧落下黄泉，两处茫茫皆相见<b>sasa</b>',
        icon: path.join(__dirname, '../resource/icon/robot.png'), // Absolute path (doesn't work on balloons)
        sound: true, // Only Notification Center or Windows Toasters
        type: "warn",
        wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
    },
    function (err, response, metadata) {
        // Response is response from notification
        // Metadata contains activationType, activationAt, deliveredAt
        console.debug(err, response)
    }
)

// Triggers if `wait: true` and user clicks notification
notifier.on('click', function (notifierObject, options, event) {
    console.debug("通知被点击", notifierObject, options, event)
})

// Triggers if `wait: true` and notification closes
notifier.on('timeout', function (notifierObject, options) {
    console.debug("通知超时", notifierObject, options)
})
