/**
 * Module to handle the user routes.
 */

// Requires.
let User = require('./../../lib/db/models/user')
let axios = require('axios')

/**
 * Updates or creates a user with the user's access token.
 */
module.exports.updateUser = function updateUser () {
  return function (req, res, next) {
    User.findOneAndUpdate({user: req.user.user}, {user: req.user.user, accessToken: req.user.accessToken}, { upsert: true, new: true },
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
 * Updates the user with the latest ETag  and time to check for updated events from Github.
 */
module.exports.setLatestPoll = function setLatestPoll () {
  return function (req, res, next) {
    axios({
      method: 'HEAD',
      headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
      url: 'https://api.github.com/users/' + req.user.user + '/events/orgs/' + req.body.org
    })
    .then((response) => {
      let newEventTime = {
        latestETag: response.headers.etag,
        atTime: new Date()
      }

      User.findOneAndUpdate({user: req.user.user}, {poll: newEventTime}, { new: true },
        (err, result) => {
          if (err) {
            return next({message: 'Error saving ETag to database'})
          } else {
            req.status = 204
            return next()
          }
        })
    })
    .catch((error) => {
      return next(error)
    })
  }
}
