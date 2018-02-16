/**
 * Router for the gateway-pages.
 */

// Requires.
let RestifyRouter = require('restify-router').Router
let router = new RestifyRouter()
let opts = require('../handlers/optionshandlers')
let auth = require('../handlers/authhandler')

// Routes.
router.opts('/login', opts.postResource)
router.post('/login', auth.login)

// Exports.
module.exports = router
