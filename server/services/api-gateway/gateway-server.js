/**
 * Server starting point.
 **/

// Requires
let port = process.env.PORT || 5050
let EventEmitter = require('events')
let messages = new EventEmitter()
require('dotenv').config()

let http = require('http')
let websocket = require('./servers/socket')
let app = require('./servers/app')(http, messages, websocket)

// Start the server----------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log('server up on port ' + port)
})
