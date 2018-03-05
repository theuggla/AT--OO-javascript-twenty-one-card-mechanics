/**
 * Server starting point.
 **/

// Requires
let app = require('express')()
let http = require('http').Server(app)
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
let bodyParser = require('body-parser')
require('dotenv').config()

let home = require('./routes/home')
let github = require('./routes/github')
let notifications = require('./routes/notifications')
let jwt = require('./resources/auth/jwt')
let port = '5050'

// Middlewares------------------------------------------------------------------------------------------------------

// JSON support
app.use(bodyParser.json())

// HTML form data support
app.use(bodyParser.urlencoded({extended: true}))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

io.use((socket, next) => {
  let token = socket.handshake.headers['authorization']
  console.log(token)
  if (jwt.validate(token)) {
    console.log('valid')
    // jwt is valid, chack that user is a member of the organization they are trying to join
    return next()
  }
  return next(new Error('authentication error'))
})

// Routes----------------------------------------------------------------------------------------------------
app.use('/', home)
app.use('/notifications', notifications)
app.use('/github', github)

io.on('connection', (socket) => {
  console.log('connecting')
  console.log(socket)
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
