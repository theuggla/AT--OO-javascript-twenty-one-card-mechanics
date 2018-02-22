let errs = require('restify-errors')

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

module.exports.authorize = function (req, res, next) {
  if (req.user.id === req.params.id) {
    return next()
  } else {
    let e = new errs.ForbiddenError()
    res.send(e)
  }
}
