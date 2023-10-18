process.env.NODE_ENV = 'test'

const { launch } = require("../../src/worker/worker");

launch({
    secretKey:"MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAMHGSzmoH3bLiJcjj1akoz63yXDCxbUTh6qXq0wLMXnC94wtF+U1lxvj6wgroDgn7lnIONzZ72U/En5jXIBcsftxz8I5ImP4R+uAW45BwgYTTrBM8ICzzly7dANYgWY9zQP/ftfT2W3kJuzEImJoN//6mgB2/6pvC2pEKmx6tx0tAgMBAAECgYAIF1APzcHWk4QWD4GONByu4zyxjSh1OaYKDQA1kigUNfxhKYbcZsLzAq7PLgcoIR62OAKL0jvJRftvNJXptDUoQIgmEBQnDFzBPSnQFjWodvJvwzRcprxW686WRV8xziTZfGCWIB1IXciPdfsQKAjRxTODbNAuqrriWizF/7nJ0QJBAOgg0Qt6tcEOIeCFq4xgw0XyHfYWz/wBIXwoK6GNi8lQJFthLLngNb9sBI1rPZAy3/s+JS9+GIjag8eWqliXdWUCQQDVs8BG8K8+TqPKfVEkcqUdE1laoKNgwQ4kclTLiWxoi7Bsflopavpk6ZDVg7msSZ85SV5b+8uIxsKOzsWwMxApAkEA5OevnYVVhFoeWB0YzSaCihA3MXzPfq/SyG+IjxhZF507LQ2HoIiUF/86AgcVv4Qb0dM3sjzDjvkE6KYPt6sr7QJBAKNW3ORcGtYY7YBcAKVHK4TpwSZQGhBd/x1EdiOMSlwuSQ7kFK4Loo93JsjMAiL5ssXqmkDcWFmW8iaNTPS8UuECQBvEFZ/CjBsrrZn/A+eXm50zUYf/MNb8xyv4ENAoFPxsuSucuGM4pXoQqiO1Mj/SiPFKin0QTSXGDAHlnRn53JY="
})


/**
 * 客户端测试
 * fetch("http://localhost:9900/", {
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "abc",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(v=>v.json()).then(v=>console.debug(v))
 */
