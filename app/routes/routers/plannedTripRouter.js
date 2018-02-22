/**
 * Router for the trip-pages.
 */

// Requires.
let RestifyRouter = require('restify-router').Router
let router = new RestifyRouter()
let passport = require('passport')
let mw = require('../../middleware/middleware')
let opts = require('../handlers/optionshandlers')
let plannedtrips = require('../handlers/plannedtriphandler')

// Routes.
router.opts({name: 'plannedtrip', path: '/plannedtrips'}, opts.safeResource)
router.get('/plannedtrips', plannedtrips.list)

router.opts({name: 'pthook', path: '/plannedtrips/webhook'}, opts.addResource)
router.get('/plannedtrips/webhook', plannedtrips.hookinfo)
router.post('/plannedtrips/webhook', plannedtrips.addhook)

router.opts('/plannedtrips/:id', passport.authenticate('jwt', { session: false }), mw.getAuthLevel, (req, res, next) => { req.user.authorized ? opts.updateResource(req, res, next) : opts.safeResource(req, res, next) })
router.get('/plannedtrips/:id', passport.authenticate('jwt', { session: false }), mw.getAuthLevel, plannedtrips.info)
router.put('/plannedtrips/:id', passport.authenticate('jwt', { session: false }), mw.authorize, plannedtrips.update)
router.del('/plannedtrips/:id', passport.authenticate('jwt', { session: false }), mw.authorize, plannedtrips.delete)

// Exports.
module.exports = router
