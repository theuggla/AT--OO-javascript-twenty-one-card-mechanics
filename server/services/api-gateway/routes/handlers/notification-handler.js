/**
 * Module to handle the notification routes.
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
 * Adds a user in the notification service.
 */
module.exports.authorizeUser = function authorizeUser () {
  return function (req, res, next) {
    axios({
      method: 'PUT',
      headers: {'Authorization': req.headers.authorization},
      url: process.env.NOTIFICATION_SERVICE + '/users'
    })
    .then(() => {
      return next()
    })
    .catch((err) => {
      req.error = err
      return next()
    })
  }
}

/**
 * Adds a subscriptionID for the user.
 */
module.exports.addSubscription = function addSubscription () {
  return function (req, res, next) {
    axios({
      method: 'PUT',
      headers: {'Authorization': req.headers.authorization},
      url: process.env.NOTIFICATION_SERVICE + '/users/subscriptions/' + req.params.id
    })
    .then((result) => {
      req.result = req.result || {}
      return next()
    })
    .catch((error) => {
      req.error = error
      return next()
    })
  }
}

/**
 * Adds a subscriptionID for the user.
 */
module.exports.removeSubscription = function addSubscription () {
  return function (req, res, next) {
    axios({
      method: 'DELETE',
      headers: {'Authorization': req.headers.authorization},
      url: process.env.NOTIFICATION_SERVICE + '/users/subscriptions/' + req.params.id
    })
    .then((result) => {
      req.result = req.result || {}
      return next()
    })
    .catch((error) => {
      req.error = error
      return next()
    })
  }
}

/**
 * Listens for notification events to send offline notification to user.
 */
module.exports.handleNotificationEvents = function handleUserConnectionEvents () {
  messages.on('offline notification', (data) => {
    console.log('got offline notification event')
    console.log(data)
    axios({
      method: 'POST',
      headers: {'Authorization': 'Bearer ' + jwt.create(data.user)},
      url: process.env.NOTIFICATION_SERVICE + '/users/notify',
      data: data.payload
    })
  })

  messages.on('user disconnect', (data) => {
    axios({
      method: 'POST',
      headers: {'Authorization': 'Bearer ' + jwt.create(data.user)},
      url: process.env.GITHUB_SERVICE + '/user/poll',
      data: {
        org: data.org
      }
    })
  })
}

