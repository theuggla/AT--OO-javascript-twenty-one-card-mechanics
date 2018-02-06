/**
 * Module to sign jwt:s containing the user information.
 */

// Requires.
let jwt = require('jsonwebtoken')

/**
 * Create a JWT.
 */
function create (user) {
  let payload = user
  return jwt.sign(payload, process.env.JWT_SECRET)
}

// Exports.
module.exports = {
  create: create
}
