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

// Config----------------------------------------------------------------------------------------------------------
require('dotenv').config()

let io = require('socket.io')(http, {
  handlePreflightRequest: function (req, res) {
    let headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': 'http://127.0.0.1:5151',
      'Access-Control-Allow-Credentials': true
    }

    res.writeHead(200, headers)
    res.end()
  }
})

// Middlewares------------------------------------------------------------------------------------------------------

// JSON support
app.use(bodyParser.json())

// HTML form data support
app.use(bodyParser.urlencoded({extended: true}))

// Extract and validate JWT
app.use(jwt({
  secret: publicKey
}).unless({path: ['/github/authorize', /(\/github\/event\/)[^ ]*/]}))

// Cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

// Websocket
io.use((socket, next) => {
  let token = socket.handshake.headers['authorization']
  // check if jwt is valid, chack that user is a member of the organization they are trying to join
  return next()
})

// Routes----------------------------------------------------------------------------------------------------
app.use('/', home)
app.use('/notifications', notifications)
app.use('/github', github)

io.on('connection', (socket) => {
  var room = socket.handshake['query']['organization']

  socket.join(room)

  socket.on('disconnect', () => {
    socket.leave(room)
  })

  socket.on('chat message', (msg) => {
    io.to(room).emit('chat message', msg)
  })
})

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
