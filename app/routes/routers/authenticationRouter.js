/**
 * Router for the authentication-pages.
 */

// Requires.
let RestifyRouter = require('restify-router').Router
let router = new RestifyRouter()
let opts = require('../handlers/optionshandlers')
let auth = require('../handlers/authhandler')

// Routes.
router.opts({name: 'authenticate', path: '/authenticate'}, opts.postResource)
router.post('/authenticate', auth.login)

// Exports.
module.exports = router
