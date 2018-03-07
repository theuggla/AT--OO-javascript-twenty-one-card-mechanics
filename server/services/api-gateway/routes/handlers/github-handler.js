/**
 * Module to handle the organization routes against the github middleware.
 */

// Requires.
let axios = require('axios')
let jwt = require('./../../lib/auth/jwt')
let messages

/**
 * Sets the eventChannel
 */
module.exports = function (eventChannel) {
  messages = eventChannel
}

/**
 * Updates the user's access token against the github service, and
 * returns a jwt with the user's username.
 */
module.exports.authorizeUser = function authorizeUser () {
  return function (req, res, next) {
    axios({
      method: 'PUT',
      headers: {'Authorization': 'Bearer ' + jwt.create(req.body)},
      url: process.env.GITHUB_SERVICE + '/user'
    })
    .then((response) => {
      req.result = req.result || {}
      req.result.token = jwt.create(response.data)
      return next()
    })
    .catch((err) => {
      req.error = err
      return next()
    })
  }
}

/**
 * Gets all of a users organizations, ehere the user is an administrator.
 */
module.exports.getAdminOrganizations = function getAdminOrganizations () {
  return function (req, res, next) {
    axios({
      method: 'get',
      headers: {'Authorization': req.headers.authorization},
      url: process.env.GITHUB_SERVICE + '/organizations'
    })
    .then((organizations) => {
      req.result = req.result || {}
      req.result.organizations = organizations.data
      return next()
    })
    .catch((error) => {
      req.error = error
      return next()
    })
  }
}

/**
 * Creates webhooks on the organizations if there are none for this client already.
 */
module.exports.createWebHooks = function createWebHooks () {
  return function (req, res, next) {
    if (!(req.result || (req.result && !req.result.organizations))) {
      return next({status: 500, message: 'Middleware called out of order.'})
    }

    Promise.all(req.result.organizations.map((organization) => {
      return axios({
        method: 'PUT',
        headers: {'Authorization': req.headers.authorization},
        url: process.env.GITHUB_SERVICE + '/organizations/hooks/' + organization.login,
        data: {callback: process.env.CURRENT_URL + '/github/event/' + req.user + '/' + organization.login}
      })
    }))

    return next()
  }
}

/**
 * Recieves events from Github from registred webhooks.
 * Listens to messages regarding user connect or disconnect, to know wheter to emit a
 * websocket-event or a offline notification-event.
 */
module.exports.handleGithubEvents = function handleGithubEvents (socket) {
  return function (req, res, next) {
    messages.on('user connect', (data) => {
      console.log('user connect')
      console.log(data)
      // collect events since last etag and sent them away to websocket
    })

    messages.on('user disconnect', (data) => {
      console.log('user disconnect')
      console.log(data)
      // poll for etag and save it away in notifications
    })

    let type = req.headers['x-github-event']
    let data = req.body
    console.log('got event')
    console.log(req.body)

    socket.isUserConnected(req.params.user, req.params.organization)
      .then((connected) => {
        if (connected) {
          console.log('user online')
          messages.emit('socket notification', {type: type, data: data})
        } else {
          console.log('user not online')
          messages.emit('offline notification', {type: type, data: data})
        }
      })
  }
}
