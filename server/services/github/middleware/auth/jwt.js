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
let User = require('./../../lib/db/models/user')

/**
 * Validate a JWT.
 */
function validate () {
  return function (req, res, next) {
    let token = parse(req)
    if (!token) {
      req.error = {message: 'No auth-token found.'}
      return next()
    } else {
      jwt.verify(token, publicKey, {algorithms: ['RS256']}, (err, decoded) => {
        if (err) {
          return next(err)
        } else if (req.path !== '/user') {
          User.findOne({user: decoded})
          .then((user) => {
            req.user = user
            return next()
          })
          .catch(() => {
            req.error = {message: 'user not found in database'}
            return next()
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
