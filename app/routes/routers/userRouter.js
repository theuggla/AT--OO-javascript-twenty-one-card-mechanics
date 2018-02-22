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
let pt = require('../handlers/plannedtriphandler')

// Routes.
router.opts({name: 'users', path: '/users'}, passport.authenticate('jwt', { session: false }), opts.safeResource)
router.get('/users', passport.authenticate('jwt', { session: false }), user.list)

router.opts('/users/:id', passport.authenticate('jwt', { session: false }), mw.getAuthLevel, (req, res, next) => { req.user.authorized ? opts.putResource(req, res, next) : opts.safeResource(req, res, next) })
router.get('/users/:id', passport.authenticate('jwt', { session: false }), mw.getAuthLevel, user.info)
router.put('/users/:id', passport.authenticate('jwt', { session: false }), mw.authorize, user.update)

router.opts('/users/:id/driving', passport.authenticate('jwt', { session: false }), mw.authorize, opts.addResource)
router.get('/users/:id/driving', passport.authenticate('jwt', { session: false }), mw.authorize, pt.collectionByDriver)
router.post('/users/:id/driving', passport.authenticate('jwt', { session: false }), mw.authorize, pt.add)

router.opts('/users/:id/passenger', passport.authenticate('jwt', { session: false }), mw.authorize, opts.safeResource)
router.get('/users/:id/passenger', passport.authenticate('jwt', { session: false }), mw.authorize, pt.collectionByPassenger)

// Exports.
module.exports = router
