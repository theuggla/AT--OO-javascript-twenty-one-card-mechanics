/**
 * Router for the gateway-pages.
 */

// Requires.
let RestifyRouter = require('restify-router').Router
let router = new RestifyRouter()
let passport = require('passport')
let mw = require('../../middleware/middleware')
let opts = require('../handlers/optionshandlers')
let user = require('../handlers/userhandler')

// Routes.
router.opts('/users/:id', passport.authenticate('jwt', { session: false }), mw.getAuthLevel, (req, res, next) => { req.user.authorized ? opts.updateResource(req, res, next) : opts.safeResource(req, res, next) })
router.get('/users/:id', passport.authenticate('jwt', { session: false }), mw.getAuthLevel, user.info)
router.put('/users/:id', passport.authenticate('jwt', { session: false }), mw.authorize, user.update)
router.del('/users/:id', passport.authenticate('jwt', { session: false }), mw.authorize, user.delete)

// Exports.
module.exports = router
