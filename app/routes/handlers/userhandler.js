/**
 * Handlers for the user-routes.
 */

let User = require('../../models/User')

module.exports.info = function (req, res, next) {
  if (req.user.authorized) res.send({message: 'Large user info'})
  else res.send({message: 'Small user info'})
  next(false)
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
