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
 * Gets all of a users organizations, where the user is an administrator.
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
    .then(() => {
      return next()
    })
  }
}

/**
 * Recieves events from Github from registred webhooks.
 * Listens to messages regarding user connect or disconnect, to know wether to emit a
 * websocket-event or a offline notification-event.
 */
module.exports.handleGithubEvents = function handleGithubEvents (userWebsocketConnection) {
  return function (req, res, next) {
    console.log('got event')
    let eventType
    let payload

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

    userWebsocketConnection(req.params.user, req.params.organization)
      .then((connected) => {
        if (connected) {
          console.log('user online')
          eventType = 'socket notification'
        } else {
          console.log('user not online')
          eventType = 'offline notification'
        }

        payload = req.body
        payload.type = req.headers['x-github-event']

        sendMessage(eventType, createMessage(payload, 'current'))
      })
  }
}

/**
 * Formats the json payload.
 */
function createMessage (data, type) {
  let payload = {}

  if (type === 'current') {
    payload.type = data.type || 'unknown action'
    payload.user = data.sender.login || 'unknown user'
    payload.repo = data.repository.name || 'no repository'
    payload.time = new Date().toLocaleDateString()
    payload.organization = data.organization.login
  } else if (type === 'retrieved') {
    payload.type = data.type || 'unknown action'
    payload.user = data.actor.login || 'unknown user'
    payload.repo = data.repo.name || 'no repository'
    payload.time = new Date(data.created_at).toLocaleDateString()
    payload.organization = data.organization.login
  }

  return payload
}

/**
 * Emits a message event to the event channel.
 */
function sendMessage (event, payload) {
  messages.emit(event, payload)
}
