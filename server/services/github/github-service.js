// Requires-----------------------------------------------------------------------------------------------------
let express = require('express')
let app = express()
require('dotenv').config()
let port = 5252
let serviceName = process.env.SERVICE_NAME
let db = require('./lib/db')

// Config-------------------------------------------------------------------------------------------------------
db.connect()

// Routes-------------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({message: 'Hello World! I am ' + serviceName + '!'})
})

// Start service-------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log('Github service listening on port ' + port + '!')
})
