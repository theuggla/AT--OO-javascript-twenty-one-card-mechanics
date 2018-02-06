/**
 * Module to authenticate the user through github
 * with the passport module.
 */

// Requires.
let passport = require('passport')
let Strategy = require('passport-github').Strategy

/**
 * Initialize the authentication.
 */
function connect () {
  passport.use(new Strategy({ clientID: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET
  }, (accessToken, refreshToken, profile, done) => {
    if (profile) {
      profile.accessToken = accessToken
      done(null, profile)
    } else {
      done({message: 'User did not allow delegation.'})
    }
  }))
}

// Exports.
module.exports = {
  connect: connect
}
