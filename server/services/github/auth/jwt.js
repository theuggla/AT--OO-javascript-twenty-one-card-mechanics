/**
 * Module to sign jwt:s containing the user information.
 */

// Requires.
let jwt = require('jsonwebtoken')
let parse = require('parse-bearer-token')
let fs = require('fs')
let path = require('path')

let cwd = __dirname || process.cwd
let publicKey = fs.readFileSync(path.resolve(cwd, './jwtRS256.key.pub'))
let User = require('./../models/user')

/**
 * Validate a JWT.
 */
function validate () {
  return function (req, res, next) {
    let token = parse(req)
    if (!token) {
      return next({message: 'No auth-token found.'})
    } else {
      console.log(token)
      jwt.verify(token, publicKey, {algorithms: ['RS256']}, (err, decoded) => {
        if (err) {
          return next(err)
        } else if (req.path !== '/user') {
          User.findOne({user: decoded})
          .then((user) => {
            req.user = user
            return next()
          })
          .catch((error) => {
            console.log(error)
            return next({message: 'user not found in database'})
          })
        } else {
          req.user = decoded
          return next()
        }
      })
    }
  }
}

// Exports.
module.exports = {
  validate: validate
}
