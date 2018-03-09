/**
 * Websocket connections server.
 */

// Variables
let jwt
let io
let clients = {
  name: {
    sockets: []
  }
}
let messages

/**
 * Connect to the socket.
 * @param {EventEmitter} eventChannel The event-channel of the server.
 */
module.exports = function (server, eventChannel) {
  // Connect IO
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

  // Set variables
  messages = eventChannel
  jwt = require('./../lib/auth/jwt')

  // Handle connections
  connectAuthMiddleware()
  handleConnections()
}

/**
 * Confirms the user is authorized before connecting.
 */
function connectAuthMiddleware () {
  io.use((socket, next) => {
    if (socket.handshake.headers.authorization) {
      if (authorizeUser(socket)) return next()
    }
  })
}

/**
 * Validates the user's JWT and logs the connection id to the username.
 */
function authorizeUser (socket) {
  let user = jwt.validate(socket.handshake.headers.authorization)

  if (user) {
    clients[user] = clients[user] || { sockets: [] }
    socket.user = user
  }

  return user
}

/**
 * Joins user to selected room, maps socket id to username, and sets up handling
 * of external messages and disconnect events.
 */
function handleConnections () {
  io.on('connection', (socket) => {
    handleConnection(socket)
    joinRoom(socket)
    handleDisconnect(socket)
  })

  sendMessageOnMessageEvent()
}

/**
 * Maps socket id to username.
 */
function handleConnection (socket) {
  clients[socket.user].sockets.push(socket.id)
  messages.emit('user connect', {user: socket.user, org: socket.handshake.query.organization})
}

/**
 * Joins socket to a room from the socket query.
 */
function joinRoom (socket) {
  let room = socket.handshake.query.organization
  socket.join(room)
}

/**
 * Removes socket id from user map and sends out a disconnect
 * event in the message channel.
 */
function handleDisconnect (socket) {
  socket.on('disconnect', () => {
    messages.emit('user disconnect', {user: socket.user, org: socket.handshake.query.organization})
  })
}

/**
 * Listens for message events on the event channel.
 */
function sendMessageOnMessageEvent () {
  messages.on('socket notification', (message) => {
    sendMessage(message, message.organization)
  })
}

/**
 * Sends messages to a specific room.
 * @param {String} room the room to send to.
 * @param {String} data the data to send.
 */
function sendMessage (data, room) {
  room = room || 'general'
  console.log('sending message to ' + room)
  io.to(room).emit('event', data)
}

/**
 * Checks if a user is connected to a certain room.
 * @param {String} username The username to check for.
 * @param {String} room  The room to check for.
 */
function isUserConnected (username, room) {
  return new Promise((resolve, reject) => {
    io.of('/').in(room).clients((err, clientsInRoom) => {
      if (err) reject(err)

      let connectedRooms = clients[username] ? clients[username].sockets.filter((socket) => {
        return (clientsInRoom.indexOf(socket) !== -1)
      }) : []

      resolve(connectedRooms.length && (connectedRooms.length > 0))
    })
  })
}

// Exports
module.exports.isUserConnected = isUserConnected
