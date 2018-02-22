/**
 * Handlers for the user-routes.
 */

let User = require('../../models/User')
let PlannedTrip = require('../../models/PlannedTrip')
let userResource = require('../../lib/resources/user')

module.exports.info = function (req, res, next) {
  if (req.user.authorized) {
    Promise.all([PlannedTrip.find({_creator: req.user._id}), PlannedTrip.find({passengers: req.user._id})])
    .then((results) => {
      return userResource.getExpandedUser(req.user, results[0], results[1])
    })
    .then((user) => {
      return res.send(user)
    })
  } else {
    User.findOne({_id: req.params.id})
    .then((user) => {
      return userResource.getSimpleUser(user)
    })
   .then((userResource) => {
     return res.send(userResource)
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

module.exports.list = function (req, res, next) {
  User.find({})
  .then((users) => {
    return userResource.getList(users)
  })
  .then((userresource) => {
    return res.send(userresource)
  })
}
