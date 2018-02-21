/*
* Handler for auth-pages.
*/

// Requires
let User = require('../../models/User')
let jwt = require('../../lib/auth/jwt')
let resource = require('../../lib/resources/landing')
let authresource = require('../../lib/resources/authenticate')
let err = require('restify-errors')

// Return info about login flow
module.exports.info = function (req, res, next) {
  authresource.getBase()
  .then((json) => {
    res.send(json)
  })
}

// Return JWT to authenticated user.
module.exports.login = function (req, res, next) {
  if (!(req.body) || !(req.body.email && req.body.password)) {
    return next(new err.BadRequestError({message: 'No credentials provided for login'}))
  } else {
    let email = req.body.email
    let password = req.body.password

    User.findOne({email: email})
    .then((user) => {
      if (!user) {
        throw new err.UnauthorizedError({message: 'Wrong credentials'})
      } else {
        return user.comparePassword(password.trim())
      }
    })
    .then((isMatch) => {
      if (!isMatch) {
        throw new err.UnauthorizedError({message: 'Wrong credentials'})
      } else {
        return User.findOne({email: email})
      }
    })
    .then((user) => {
      return Promise.all([resource.getExpanded(user), Promise.resolve(user)])
    })
    .then((result) => {
      let token = jwt.create({id: result[1]._id})
      res.header('Authorization', 'Bearer ' + token)
      return res.send(result[0])
    })
    .catch((err) => {
      return next(err)
    })
  }
}
