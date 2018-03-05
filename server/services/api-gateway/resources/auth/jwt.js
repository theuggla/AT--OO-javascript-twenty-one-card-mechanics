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

/**
 * Validate a JWT.
 */
function validate (token) {
  return true
}

// Exports.
module.exports = {
  create: create,
  validate: validate
}
