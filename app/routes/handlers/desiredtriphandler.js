/**
 * Handlers for the user-routes.
 */

let DesiredTrip = require('../../models/DesiredTrip')

module.exports.info = function (req, res, next) {
  if (req.user.authorized) res.send({message: 'Large trip info'})
  else res.send({message: 'Small trip info'})
  next(false)
}

module.exports.update = function (req, res, next) {
  console.log('updating trip')
  res.send({message: 'trip updated'})
  next(false)
}

module.exports.delete = function (req, res, next) {
  console.log('deleting trip')
  res.send({message: 'trip deleted'})
  next(false)
}
