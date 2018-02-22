let errs = require('restify-errors')
let Trip = require('../models/PlannedTrip')

module.exports.acceptJSON = function (req, res, next) {
  if (req.accepts('application/json')) {
    next()
  } else {
    let e = new errs.NotAcceptableError()
    res.send(e)
  }
}

module.exports.getAuthLevel = function (req, res, next) {
  if (req.user.id === req.params.id) {
    req.user.authorized = true
  } else {
    req.user.authorized = false
  }

  return next()
}

module.exports.getAuthLevelForTrip = function (req, res, next) {
  Trip.findOne({_id: req.params.id})
  .then((trip) => {
    if (req.user.id === trip._creator || (trip.passengers.indexOf(req.user.id) > -1)) {
      req.user.authorized = true
    } else {
      req.user.authorized = false
    }

    return next()
  })
}

module.exports.authorize = function (req, res, next) {
  if (req.user.id === req.params.id) {
    return next()
  } else {
    let e = new errs.ForbiddenError()
    res.send(e)
  }
}
