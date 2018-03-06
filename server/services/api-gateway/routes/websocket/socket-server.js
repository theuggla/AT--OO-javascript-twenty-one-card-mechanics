/**
 * Module to handle the websocket connections.
 */

// Socket
let root
let socketUsers
let rootUsers
let jwt = require('./../../resources/auth/jwt')

/**
 * Connect to the socket.
 * @param {*} server The server to connect through.
 */
module.exports.connect = function (server, app) {
  socketUsers = require('socket.io.users')
  rootUsers = socketUsers.Users
  socketUsers.Session(app)

  root = require('socket.io')(server, {
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
}

module.exports.handleConnections = function () {
  return function (req, res, next) {
    root.use(socketUsers.Middleware())

    /*root.on('connection', (socket) => {
      console.log('main connection')
      // Do auth on jwt, move id t query, check that user is an admin of the organization they are trying to join
      /*console.log('ths happens first')
      console.log('IO DEBUG: Socket ' + socket.id + ' is ready \n')
      console.log('got socket connection')
      console.log(socket.handshake.headers.authorization)
      console.log(socket.handshake['query'])
      console.log('user ' + socket.id + ' connected')

      // Have global array with rooms?

      console.log(socket.handshake.headers.authorization)
      socket.handshake['query'].id = jwt.validate(socket.handshake.headers.authorization)
    })*/

    rootUsers.on('connection', (user) => {
      user.socket.rooms = []
      let alreadyConnected = user.get('username') === user.id

      if (!alreadyConnected) {
        user.id = jwt.validate(user.id)
        user.set('username', user.id)
        root.emit('set username', user.get('username'))
      }
      
      console.log('User with ID: ' + user.id + ' is here')
      console.log(user.socket.handshake['query']['organization'])

      var room = user.socket.handshake['query']['organization']

      console.log(user.socket.rooms)
      user.join(room)
      console.log(user.rooms)
    })
    
    rootUsers.on('disconnected', function (user) {
      console.log('User with ID: ' + user.id + 'is gone away :(')
      user.leaveAll()
    })

    return next()
  }
}

module.exports.userConnected = function (username, room) {
  let user = rootUsers.users.find((user) => {
    return user.id === username
  })

  return user.rooms.indexOf(room.toString()) !== -1
}

module.exports.sendMessage = function (room, data) {
  console.log('sending ' + data.message + ' to ' + room)
  root.to(room).emit('event', data)
}
