/**
 * Module to authenticate the user through a JWT
 * with the passport module
 * and save the user into the site's database.
 */

// Requires.
let fs = require('fs')
let passport = require('passport')
let Strategy = require('passport-jwt').Strategy
let extractJWT = require('passport-jwt').ExtractJwt

let User = require('../models/User')
let publicKey = fs.readFileSync('../../../certs/jwtRS256.key.pub')

/**
 * Initialize the authentication and set up the handling
 * against the database.
 */
function connect () {
  passport.use(new Strategy({
    jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: publicKey
  }, (payload, done) => {
    User.findById(payload.id)
    .then((user) => {
      if (user) {
        return done(null, user)
      } else {
        return done(null, false)
      }
    })
  }))
}

// Exports.
module.exports = {
  connect: connect
}
