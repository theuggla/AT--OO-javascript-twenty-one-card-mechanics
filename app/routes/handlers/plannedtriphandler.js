/**
 * Handlers for the planned trip-routes.
 */

let PlannedTrip = require('../../models/PlannedTrip')
let ptresource = require('../../lib/resources/plannedTripCollection')

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
  sendHook({message: 'tripinfo'})
  res.send({message: 'trip added'})
  next(false)
}

module.exports.deletePassenger = function (req, res, next) {
  console.log('deleting passenger')
  res.send({message: 'passenger deleted'})
  next(false)
}

module.exports.list = function (req, res, next) {
  PlannedTrip.find({})
  .then((allTrips) => {
    return ptresource.getList(allTrips)
  })
  .then((listresource) => {
    return res.send(listresource)
  })
}

module.exports.collectionByDriver = function (req, res, next) {
  PlannedTrip.find({_creator: req.user._id})
  .then((allTrips) => {
    console.log(allTrips)
    return ptresource.getDriverList(allTrips)
  })
  .then((listresource) => {
    return res.send(listresource)
  })
}

module.exports.collectionByPassenger = function (req, res, next) {
  PlannedTrip.find({passengers: req.user._id})
  .then((allTrips) => {
    return ptresource.getPassengersList(allTrips)
  })
  .then((listresource) => {
    return res.send(listresource)
  })
}

module.exports.hookinfo = function (req, res, next) {
  console.log('webhook')
}

module.exports.addhook = function (req, res, next) {
  console.log('add webhook')
}

function sendHook (trip) {
  console.log('sending webhook notification')
  console.log(trip)
}
