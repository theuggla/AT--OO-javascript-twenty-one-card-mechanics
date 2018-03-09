/**
 * Module to handle the user routes.
 */

// Requires.
let User = require('./../../lib/db/models/user')

/**
 * Creates or finds a user with the user's username.
 */
module.exports.createUser = function createUser () {
  return function (req, res, next) {
    User.findOneAndUpdate({user: req.user.user}, {user: req.user.user}, { upsert: true, new: true },
    (err, result) => {
      if (err) {
        req.error = {message: 'Error saving user to database'}
        return next()
      } else {
        req.result = req.result || {}
        req.result.user = result.user
        return next()
      }
    })
  }
}

/**
 * Updates a user with the user's subscription id.
 */
module.exports.subscribeUser = function subscribeUser () {
  return function (req, res, next) {
    console.log('in /subscribe')
    req.status = 201
    return next()
  }
}

/**
 * Deletes a users subscription IDs.
 */
module.exports.unsubcribeUser = function unsubcribeUser () {
  return function (req, res, next) {
    console.log('in /unsubscribe')
    req.status = 204
    return next()
  }
}

/**
 * Notifies the user of an event.
 */
module.exports.notifyUser = function verifyUser () {
  return function (req, res, next) {
    console.log('in /notify')
    return next()
  }
}
