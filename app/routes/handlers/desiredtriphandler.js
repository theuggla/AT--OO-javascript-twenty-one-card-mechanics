/**
 * Handlers for the desired trip-routes.
 */

let DesiredTrip = require('../../models/DesiredTrip')
let dtresource = require('../../lib/resources/desiredTripCollection')

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

module.exports.add = function (req, res, next) {
  console.log('adding trip')
  res.send({message: 'trip added'})
  next(false)
}

module.exports.list = function (req, res, next) {
  DesiredTrip.find({})
  .then((allTrips) => {
    return dtresource.getList(allTrips)
  })
  .then((listresource) => {
    return res.send(listresource)
  })
}
