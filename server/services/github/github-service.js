let express = require('express')
let app = express()
let port = 3000
let serviceName = process.env.SERVICE_NAME

app.get('/', (req, res) => {
  let d = new Date()

  console.log(JSON.stringify({
    time: 'Got connection at: ' + d.getDate() + ' Time: ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds(),
    ip: req.connection.remoteAddress,
    headers: req.headers
  }, null, 3))

  res.json({message: 'Hello World! I am ' + serviceName + '!'})
})

app.listen(port, () => {
  console.log('Github service listening on port ' + port + '!')
})
