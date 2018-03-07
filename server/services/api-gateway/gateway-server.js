/**
 * Server starting point.
 **/

// Requires
let app = require('express')()
let http = require('http').Server(app)
let bodyParser = require('body-parser')
let fs = require('fs')
let path = require('path')

let home = require('./routes/routes/home')
let github = require('./routes/routes/github')
let notifications = require('./routes/routes/notifications')
let jwt = require('express-jwt')
let port = '5050'
let cwd = __dirname || process.cwd
let publicKey = fs.readFileSync(path.resolve(cwd, './resources/auth/jwtRS256.key.pub'))
require('./routes/websocket/socket-server')(http)

// Config----------------------------------------------------------------------------------------------------------
require('dotenv').config()

// Middlewares------------------------------------------------------------------------------------------------------

// JSON support
app.use(bodyParser.json())

// HTML form data support
app.use(bodyParser.urlencoded({extended: true}))

// LOgging
app.use((req, res, next) => { console.log(req.method + ': ' + req.path); next() })

// Extract and validate JWT
app.use(jwt({
  secret: publicKey
}).unless({path: ['/github/authorize', /\/github\/event\/[^ ]*/i]}))

// Cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

// Routes----------------------------------------------------------------------------------------------------
app.use('/', home)
app.use('/notifications', notifications)
app.use('/github', github)

// Custom Error Responses-------------------------------------------------------------------------------------------------

// 400 >
app.use((req, res, next) => {
  res.status(302).redirect('/')
})

// 500
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({message: err.message})
})

// Start the server----------------------------------------------------------------------------------------------------
http.listen(port, () => {
  console.log('server up on port ' + port)
})
