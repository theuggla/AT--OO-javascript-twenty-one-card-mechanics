/**
 * Module to handle the user routes.
 */

// Requires.
let User = require('./../../lib/db/models/user')
let gcm = require('node-gcm')

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
    User.findOneAndUpdate({user: req.user.user}, {$push: {subscriptionIDs: req.params.id}}, { upsert: true, new: true },
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
    User.update({user: req.user.user}, {$pull: {subscriptionIDs: req.params.id}}, { upsert: true, new: true },
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
    console.log(req.body)
    let sender = new gcm.Sender(process.env.FCM_API_KEY)

    // Prepare a message to be sent
    let message = new gcm.Message({
      notification: {
        title: 'Hello, World',
        icon: 'ic_launcher',
        body: 'Click to see the latest commit'
      },
      data: req.body
    })

    let userIDs = req.user.subscriptionIDs

    console.log('User Ids', userIDs)
    console.log(sender)

      // Actually send the message
    sender.send(message, { registrationTokens: userIDs }, (err, response) => {
      if (err) {
        req.error = err
        console.log('got error')
        console.log(err)
      } else {
        console.log('got response')
        console.log(response)
        req.status = 204
      }

      return next()
    })
  }
}
