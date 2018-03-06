/**
 * Module to sign jwt:s containing the user information.
 */

// Requires.
let jwt = require('jsonwebtoken')
let parse = require('parse-bearer-token')
let fs = require('fs')
let path = require('path')
let cwd = __dirname || process.cwd
let publicKey = fs.readFileSync(path.resolve(cwd, './jwtRS256.key.pub'), 'utf8')
let privateKey = fs.readFileSync(path.resolve(cwd, './jwtRS256.key'), 'utf8')

/**
 * Create a JWT.
 */
function create (user) {
  let payload = user
  return jwt.sign(payload, privateKey, {algorithm: 'RS256'})
}

/**
 * Validate a JWT.
 */
function validate (token) {
  token = token.indexOf('Bearer') !== -1 ? parse(token) : token
  return jwt.verify(token, publicKey, {algoritms: ['RS256']})
}

// Exports.
module.exports = {
  create: create,
  validate: validate
}
