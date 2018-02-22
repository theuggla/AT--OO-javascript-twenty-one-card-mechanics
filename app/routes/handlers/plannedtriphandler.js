/**
 * Handlers for the planned trip-routes.
 */

let PlannedTrip = require('../../models/PlannedTrip')
let ptresource = require('../../lib/resources/plannedTripCollection')
let ptsingle = require('../../lib/resources/plannedTrip')
let err = require('restify-errors')

module.exports.info = function (req, res, next) {
  if (req.user.authorized) {
    PlannedTrip.findOne({_id: req.params.id})
    .then((trip) => {
      return ptsingle.getExtendedTrip(trip)
    })
    .then((jsontrip) => {
      return res.send(jsontrip)
    })
    .catch((error) => {
      let e = new err.NotFoundError({message: 'No such trip. ' + error.message})
      return next(e)
    })
  } else {
    PlannedTrip.findOne({_id: req.params.id})
    .then((trip) => {
      return ptsingle.getBaseTrip(trip)
    })
    .then((tripResource) => {
      return res.send(tripResource)
    })
    .catch((error) => {
      let e = new err.NotFoundError({message: 'No such trip. ' + error.message})
      return next(e)
    })
  }
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

module.exports.addPassenger = function (req, res, next) {
  console.log('adding passenger')
  res.send({message: 'passenger added'})
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

module.exports.passengers = function (req, res, next) {
  PlannedTrip.findOne({_id: req.params.id})
  .then((trip) => {
    return ptresource.getPassengerList(trip)
  })
  .then((listresource) => {
    return res.send(listresource)
  })
  .catch((error) => {
    console.log(error)
    let e = new err.NotFoundError({message: 'No such trip.'})
    return next(e)
  })
}

module.exports.collectionByDriver = function (req, res, next) {
  PlannedTrip.find({_creator: req.user._id})
  .then((allTrips) => {
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
