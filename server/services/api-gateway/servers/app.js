/**
 * Express server.
 **/

// Requires
let app = require('express')()
let bodyParser = require('body-parser')
let fs = require('fs')
let path = require('path')

let github = require('./../routes/routes/github-routes')
let notifications = require('./../routes/routes/notification-routes')
let auth = require('express-jwt')
let response = require('./../middleware/response')

let cwd = __dirname || process.cwd
let publicKey = fs.readFileSync(path.resolve(cwd, './../lib/auth/jwtRS256.key.pub'))

function listen (eventChannel, userWebsocketConnection) {
// JSON support
  app.use(bodyParser.json())

// HTML form data support
  app.use(bodyParser.urlencoded({extended: true}))

// Logging
  app.use((req, res, next) => { console.log(req.method + ': ' + req.path); next() })

// Extract and validate JWT
  app.use(auth({
    secret: publicKey
  }).unless({path: ['/github/authorize', /\/github\/event\/[^ ]*/i]}))

// Cors
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    next()
  })

// Routes-
  app.use('/github', github.create(eventChannel, userWebsocketConnection))
  app.use('/notifications', notifications.create(eventChannel))

// Respond to client
  app.use(response())

// 404
  app.use((req, res, next) => {
    res.status(404).json({message: 'Resource not found.'})
  })

// 500
  app.use((err, req, res, next) => {
    console.log(err)
    let status = err.status || 500
    let message = err.message || 'Server failure'
    res.status(status).json({message: message})
  })

  return app
}

// Exports.
module.exports = app
module.exports.listen = listen
