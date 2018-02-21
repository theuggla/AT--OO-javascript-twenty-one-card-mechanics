// Initialize resources
let landing = require('./landing')
let auth = require('./authenticate')
let dt = require('./desiredTripCollection')
let pt = require('./plannedTripCollection')

module.exports = function (server) {
  landing(server)
  auth(server)
  dt(server)
  pt(server)
}
