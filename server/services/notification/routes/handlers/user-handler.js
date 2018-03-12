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
    let subscriptions = req.user.subscriptions
    let preferences
    let repoIndex
    let organizationIndex

    organizationIndex = req.user.preferences.organizations.findIndex((org) => {
      return org.name === req.body.organization
    })

    if (organizationIndex > -1) {
      repoIndex = req.user.preferences.organizations[organizationIndex].repos.findIndex((repo) => {
        return repo.name === req.body.repo
      })
    }

    console.log(repoIndex)
    console.log(organizationIndex)

    preferences = (repoIndex > -1) ? req.user.preferences.organizations[organizationIndex].repos[repoIndex].allowedEventTypes : []

    console.log(req.user.preferences.organizations)
    console.log(preferences)
    console.log(req.body)

    if (preferences.indexOf(req.body.type) > -1) {
      subscriptions.forEach(subscriptionString => {
        let message = JSON.stringify(req.body)
        let subscription = JSON.parse(subscriptionString)
        webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: subscription.keys
        }, message)
        .then(() => {
          req.status = 204
          return next()
        })
        .catch((err) => {
          return next(err)
        })
      })
    } else {
      req.status = 202
      return next()
    }
  }
}
