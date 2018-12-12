// Initialize resources
let landing = require('./landing')
let auth = require('./authenticate')
let pt = require('./plannedTripCollection')
let ptSingle = require('./plannedTrip')
let user = require('./user')
let hook = require('./hook')

module.exports = function (server) {
  landing(server)
  auth(server)
  pt(server)
  ptSingle(server)
  user(server)
  hook(server)
}
