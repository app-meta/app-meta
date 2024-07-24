const axios = require("axios")
const { callServer, setToken } = require("../src/service/Http")

axios({
    url: "http://localhost:10086/app-meta/welcome",
    data: {},
    method: "POST"
})
.then(response=>{
    console.debug(response.data)
})
.catch(e=> {
    console.error(e)
})


setToken("----")
callServer("/welcome",{}).then(d=>console.debug("CALL-SERVER", d))
