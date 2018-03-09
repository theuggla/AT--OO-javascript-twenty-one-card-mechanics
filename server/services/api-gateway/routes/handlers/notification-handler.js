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
    console.log('authorizing')
    axios({
      method: 'PUT',
      headers: {'Authorization': 'Bearer ' + jwt.create(req.body)},
      url: process.env.NOTIFICATION_SERVICE + '/users'
    })
    .then(() => {
      console.log('back from auth')
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
    console.log('adding subscription')
    axios({
      method: 'PUT',
      headers: {'Authorization': req.headers.authorization},
      url: process.env.NOTIFICATION_SERVICE + '/users/subscriptions/' + req.params.id
    })
    .then((result) => {
      console.log('subscribed')
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
    console.log('removing subscription')
    axios({
      method: 'DELETE',
      headers: {'Authorization': req.headers.authorization},
      url: process.env.NOTIFICATION_SERVICE + '/users/subscriptions/' + req.params.id
    })
    .then((result) => {
      console.log('unsubscribed')
      req.result = req.result || {}
      return next()
    })
    .catch((error) => {
      req.error = error
      return next()
    })
  }
}
