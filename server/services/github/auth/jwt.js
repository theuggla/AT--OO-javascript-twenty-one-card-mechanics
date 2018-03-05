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

/**
 * Validate a JWT.
 */
function validate () {
  return function (req, res, next) {
    let token = parse(req)

    if (!token) {
      return next({message: 'No auth-token found.'})
    } else {
      jwt.verify(token, publicKey, {algoritms: ['RS256']}, (err, decoded) => {
        if (err) {
          return next(err)
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
