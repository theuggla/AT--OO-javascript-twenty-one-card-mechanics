// Initialize resources
let landing = require('./landing')
let auth = require('./authenticate')
let pt = require('./plannedTripCollection')
let user = require('./user')

module.exports = function (server) {
  landing(server)
  auth(server)
  pt(server)
  user(server)
}
