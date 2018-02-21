// Initialize resources
let landing = require('./landing')
let auth = require('./authenticate')

module.exports = function (server) {
  landing(server)
  auth(server)
}
