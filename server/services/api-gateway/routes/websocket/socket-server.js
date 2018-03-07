/**
 * Module to handle the websocket connections.
 */

// Socket
let io
let jwt = require('./../../resources/auth/jwt')
let clients = {
  name: {
    sockets: []
  }
}

/**
 * Connect to the socket.
 * @param {*} server The server to connect through.
 */
module.exports = function (server) {
  io = require('socket.io')(server, {
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

  io.use((socket, next) => {
    if (socket.request.method !== 'OPTIONS') {
      let user = jwt.validate(socket.handshake.headers.authorization)

      if (user) {
        if (!clients[user]) {
          clients[user] = { sockets: [] }
        }
        socket.user = user
        return next()
      }

      return next({message: 'Unauthorized'})
    }
  })

  io.on('connection', (socket) => {
    clients[socket.user].sockets.push(socket.id)
    let room = socket.handshake.query.organization
    socket.join(room)

    io.to(room).emit('event', {message: 'connected to ' + room})

    socket.on('disconnect', () => {
      let index = clients[socket.user].sockets.indexOf(socket.id)
      if (index > -1) {
        clients[socket.user].sockets.splice(index, 1)
      }
    })
  })
}

module.exports.userConnected = function (username, room) {
  return new Promise((resolve, reject) => {
    io.of('/').in(room).clients((err, clientsInRoom) => {
      if (err) reject(err)

      let connectedSockets = clients[username].sockets.filter((socket) => {
        return io.sockets.connected(socket) && (clientsInRoom.indexOf(socket) !== -1)
      })
      console.log('resolving with ' + (connectedSockets.length && connectedSockets.length > 0))
      resolve(connectedSockets.length && (connectedSockets.length > 0))
    })
  })
}

module.exports.sendMessage = function (room, data) {
  console.log('sending ' + data.message + ' to ' + room)
  io.to(room).emit('event', data)
}
