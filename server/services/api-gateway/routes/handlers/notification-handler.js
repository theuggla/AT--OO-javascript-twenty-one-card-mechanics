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
      url: process.env.NOTIFICATION_SERVICE + '/users/subscriptions/',
      data: req.body
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
      url: process.env.NOTIFICATION_SERVICE + '/users/subscriptions/',
      data: req.body
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
 * Gets te preferences for a certain organization.
 */
module.exports.getPreferences = function getPreferences () {
  return function (req, res, next) {
    axios({
      method: 'GET',
      headers: {'Authorization': req.headers.authorization},
      url: process.env.GITHUB_SERVICE + '/organizations/' + req.params.org + '/repos'
    })
    .then((result) => {
      let preferences = result.data.repos.map((repo) => {
        return new Promise((resolve, reject) => {
          axios({
            method: 'GET',
            headers: {'Authorization': req.headers.authorization},
            url: process.env.NOTIFICATION_SERVICE + '/preferences/' + req.params.org + '/' + repo
          })
          .then((result) => {
            resolve({name: repo, allowed: result.data.preferences})
          })
        })
      })
      return Promise.all(preferences)
    })
    .then((result) => {
      req.result = req.result || {}
      req.result.preferences = result
      return next()
    })
    .catch((error) => {
      req.error = error
      return next()
    })
  }
}

/**
 * Updates the preferences for a certain organization.
 */
module.exports.updatePreferences = function updatePreferences () {
  return function (req, res, next) {
    Promise.all(req.body.preferences.map((repo) => {
      return axios({
        method: 'PUT',
        headers: {'Authorization': req.headers.authorization},
        url: process.env.NOTIFICATION_SERVICE + '/preferences/' + req.params.org + '/' + repo.name,
        data: {allowed: repo.allowed}
      })
    }))
    .then((result) => {
      req.status = 204
      return next()
    })
    .catch((error) => {
      return next(error)
    })
  }
}

/**
 * Listens for notification events to send offline notification to user.
 */
module.exports.handleNotificationEvents = function handleNotificationEvents () {
  messages.on('offline notification', (data) => {
    axios({
      method: 'POST',
      headers: {'Authorization': 'Bearer ' + jwt.create(data.user)},
      url: process.env.NOTIFICATION_SERVICE + '/users/notify',
      data: data.payload
    })
  })
}
