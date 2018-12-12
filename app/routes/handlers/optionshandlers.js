/*
* Responses for OPTIONS requests.
*/

// Requires
let passport = require('passport')

/*
* Response for open GET requests.
*/
module.exports.safeResource = function (req, res, next) {
  res.header('Allow', 'GET, HEAD, OPTIONS')
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  res.send()
  next(false)
}

/*
* Response for open POST requests.
*/
module.exports.postResource = function (req, res, next) {
  res.header('Allow', 'POST, HEAD, OPTIONS')
  res.header('Access-Control-Allow-Methods', 'POST, HEAD, OPTIONS')
  res.send()
  next(false)
}

/*
* Response for updateable and deletable resources.
*/
module.exports.updateResource = function (req, res, next) {
  res.header('Allow', 'GET, DELETE, PUT, HEAD, OPTIONS')
  res.header('Access-Control-Allow-Methods', 'GET, DELETE, PUT, HEAD, OPTIONS')
  res.send()
  next(false)
}

/*
* Response for updateable resources.
*/
module.exports.putResource = function (req, res, next) {
  res.header('Allow', 'GET, PUT, HEAD, OPTIONS')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, HEAD, OPTIONS')
  res.send()
  next(false)
}

/*
* Response for collections where resources are added.
*/
module.exports.addResource = function (req, res, next) {
  res.header('Allow', 'GET, POST, HEAD, OPTIONS')
  res.header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS')
  res.send()
  next(false)
}

/*
* Response for collections where resources are deleted.
*/
module.exports.deleteResource = function (req, res, next) {
  res.header('Allow', 'GET, DELETE, HEAD, OPTIONS')
  res.header('Access-Control-Allow-Methods', 'GET, DELETE, HEAD, OPTIONS')
  res.send()
  next(false)
}

/*
* Response for collections where it depends on wheter the user is authenticated.
*/
module.exports.authLevelDependant = function (req, res, next) {
  passport.authenticate('jwt', function (err, user, info) {
    if (err) { return next(err) }

    if (!user) {
      res.header('Allow', 'GET, HEAD, OPTIONS')
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
      res.send()
      next(false)
    } else {
      res.header('Allow', 'GET, POST, HEAD, OPTIONS')
      res.header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS')
      res.send()
      next(false)
    }
  }
  )(req, res, next)
}
