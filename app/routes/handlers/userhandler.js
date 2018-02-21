/**
 * Handlers for the user-routes.
 */

let User = require('../../models/User')
let DesiredTrip = require('../../models/DesiredTrip')
let PlannedTrip = require('../../models/PlannedTrip')
let userResource = require('../../lib/resources/user')

module.exports.info = function (req, res, next) {
  if (req.user.authorized) {
    Promise.all()
    userResource.getExpandedUser(req.user)
      .then((user) => {
        res.send(user)
        next(false)
      })
  } else {
    userResource.getSimpleUser(req.user)
      .then((user) => {
        res.send(user)
        next(false)
      })
  }
}

module.exports.update = function (req, res, next) {
  console.log('updating user')
  res.send({message: 'user updated'})
  next(false)
}

module.exports.delete = function (req, res, next) {
  console.log('deleting user')
  res.send({message: 'user deleted'})
  next(false)
}
