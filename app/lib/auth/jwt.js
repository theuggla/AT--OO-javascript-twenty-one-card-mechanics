/**
 * Module to sign jwt:s with a private pem-encoded key.
 */

// Requires.
let jwt = require('jsonwebtoken')
let fs = require('fs')
let path = require('path')

let cwd = __dirname || process.cwd()
let privateKey = fs.readFileSync(path.join(cwd, '/jwtcerts/jwtRS256.key'))

/**
 * Create a JWT.
 */
function create (payload) {
  return jwt.sign(payload, privateKey)
}

// Exports.
module.exports = {
  create: create
}
