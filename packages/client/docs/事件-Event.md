# 事件/Event
> 客户端在某些操作时会广播（默认全部窗口）特定事件/Event，监听事件可增强应用的用户体验

事件ID|名称|参数说明
-|-|-
robot.start|web机器人启动|({id, aid, name}, {})：参数一为机器人基本信息，参数二为启动参数
robot.done|web机器人停止|(id, data:Object)：参数一为机器人ID，参数二为本次运行的信息描述（详见 src\core\RobotManage.js）

## 如何发布
> 代码详见 packages\client\src\service\Global.js#broadcastAll 方法

```js
const { broadcastAll } = require("./Global.js")

broadcastAll("事件ID", ...参数)
```

## 如何监听

```js
// 在 renderer 页面
META.addListener("事件ID", ()=>{})

// 示例 
META.addListener("robot.done", (id, data)=> {
    console.debug(`机器人 #${id} 执行结束`, data)
})
```
