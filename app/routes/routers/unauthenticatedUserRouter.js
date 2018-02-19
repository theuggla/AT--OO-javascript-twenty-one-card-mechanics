/**
 * Router for the gateway-pages.
 */

// Requires.
let RestifyRouter = require('restify-router').Router
let router = new RestifyRouter()
let opts = require('../handlers/optionshandlers')
let user = require('../handlers/userhandler')

// Routes.

// Exports.
module.exports = router
