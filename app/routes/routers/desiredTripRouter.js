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
router.opts({name: 'desiredtrip', path: '/desiredtrips'}, opts.safeResource)
router.get('/desiredtrips', desiredtrips.list)

router.opts({name: 'desiredtrip', path: '/desiredtrips/:id'}, passport.authenticate('jwt', { session: false }), mw.getAuthLevel, (req, res, next) => { req.user.authorized ? opts.updateResource(req, res, next) : opts.safeResource(req, res, next) })
router.get({name: 'desiredtrip', path: '/desiredtrips/:id'}, passport.authenticate('jwt', { session: false }), mw.getAuthLevel, desiredtrips.info)
router.put({name: 'desiredtrip', path: '/desiredtrips/:id'}, passport.authenticate('jwt', { session: false }), mw.authorize, desiredtrips.update)
router.del({name: 'desiredtrip', path: '/desiredtrips/:id'}, passport.authenticate('jwt', { session: false }), mw.authorize, desiredtrips.delete)

// Exports.
module.exports = router
