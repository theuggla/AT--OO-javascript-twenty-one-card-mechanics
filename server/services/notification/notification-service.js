let express = require('express')
let app = express()
let port = 3000
let serviceName = process.env.SERVICE_NAME

app.get('/', (req, res) => {
  res.json({message: 'Hello World! I am ' + serviceName + '!'})
})

app.listen(port, () => {
  console.log('Notification service listening on port ' + port + '!')
})
