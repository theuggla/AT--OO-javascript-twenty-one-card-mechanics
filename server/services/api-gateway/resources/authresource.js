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
  passport.use(new Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  },

        function (accessToken, refreshToken, profile, done) {
          profile.accessToken = accessToken
        }))
}

// Exports.
module.exports = {
  connect: connect
}
