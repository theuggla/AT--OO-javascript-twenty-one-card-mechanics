/**
 * Handlers for the user-routes.
 */

let User = require('../../models/User')
let userResource = require('../../lib/resources/user')

module.exports.info = function (req, res, next) {
  userResource.getUser(req.user)
  .then((user) => {
    if (req.user.authorized) {console.log('auth')}

    res.send(user)
    next(false)
  })
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
