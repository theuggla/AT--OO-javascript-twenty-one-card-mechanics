/**
 * Module to handle the user routes.
 */

// Requires.
let User = require('./../../lib/db/models/user')
let webpush = require('web-push')
const vapidKeys = webpush.generateVAPIDKeys()

module.exports.initialize = function initialize () {
  webpush.setGCMAPIKey(process.env.FCM_API_KEY)
  webpush.setVapidDetails(
  process.env.EMAIL,
  vapidKeys.publicKey,
  vapidKeys.privateKey)
}

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
        req.status = 201
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
    User.findOneAndUpdate({user: req.user.user}, {$push: {subscriptions: req.body.subscription}}, { upsert: true, new: true },
      (err, result) => {
        if (err) {
          req.err = err
        } else {
          req.status = 201
        }
        return next()
      })
  }
}

/**
 * Deletes a users subscription IDs.
 */
module.exports.unsubcribeUser = function unsubcribeUser () {
  return function (req, res, next) {
    User.update({user: req.user.user}, {$pull: {subscriptions: req.body.subscription}}, { upsert: true, new: true },
      (err, result) => {
        if (err) {
          req.err = err
        } else {
          req.status = 204
        }
        return next()
      })
  }
}

/**
 * Notifies the user of an event.
 */
module.exports.notifyUser = function notifyUser () {
  return function (req, res, next) {
    console.log('in /notify')

    let subscriptions = req.user.subscriptions
    let message = JSON.stringify(req.body)

    subscriptions.forEach(subscriptionString => {
      let subscription = JSON.parse(subscriptionString)
      console.log(subscription)
      webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: subscription.keys
      }, message)
      .then(() => {
        console.log('Push Application Server - Notification sent')
        req.status = 204
        return next()
      })
      .catch((err) => {
        console.log('ERROR in sending Notification, endpoint removed')
        console.log(err)
        return next()
      })
    })
  }
}
