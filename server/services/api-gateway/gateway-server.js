/**
 * Server starting point.
 **/

// Requires
let app = require('./servers/app')
let http = require('http').Server(app)
let EventEmitter = require('events')
let messages = new EventEmitter()
let port = process.env.PORT || '5050'
let userWebsocketConnection = require('./servers/socket').isUserConnected

// Config----------------------------------------------------------------------------------------------------------
require('dotenv').config()
require('./servers/socket')(http, messages)
app.listen(messages, userWebsocketConnection)

// Start the server----------------------------------------------------------------------------------------------------
http.listen(port, () => {
  console.log('server up on port ' + port)
})
