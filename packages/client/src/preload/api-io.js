const { ipcRenderer, contextBridge } = require("electron")

contextBridge.exposeInMainWorld("META", {
    onInput (text){
        ipcRenderer.send("dialog.input", text)
    }
})
