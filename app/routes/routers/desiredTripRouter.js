/**
 * Router for the trip-pages.
 */

// Requires.
let RestifyRouter = require('restify-router').Router
let router = new RestifyRouter()
let passport = require('passport')
let mw = require('../../middleware/middleware')
let opts = require('../handlers/optionshandlers')
let desiredtrips = require('../handlers/desiredtriphandler')

// Routes.
router.opts('/desiredtrips/:id', passport.authenticate('jwt', { session: false }), mw.getAuthLevel, (req, res, next) => { req.user.authorized ? opts.updateResource(req, res, next) : opts.safeResource(req, res, next) })
router.get('/desiredtrips/:id', passport.authenticate('jwt', { session: false }), mw.getAuthLevel, desiredtrips.info)
router.put('/desiredtrips/:id', passport.authenticate('jwt', { session: false }), mw.authorize, desiredtrips.update)
router.del('/desiredtrips/:id', passport.authenticate('jwt', { session: false }), mw.authorize, desiredtrips.delete)

// Exports.
module.exports = router
