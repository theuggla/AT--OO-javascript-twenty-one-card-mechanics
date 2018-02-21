/**
 * Router for the authentication-pages.
 */

// Requires.
let RestifyRouter = require('restify-router').Router
let router = new RestifyRouter()
let opts = require('../handlers/optionshandlers')
let base = require('../handlers/basehandler')

// Routes.
router.opts({name: 'home', path: '/'}, opts.safeResource)
router.get('/', base.landing)

// Exports.
module.exports = router
