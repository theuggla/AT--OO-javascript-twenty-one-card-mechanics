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
let dt = require('../handlers/desiredtriphandler')
let pt = require('../handlers/plannedtriphandler')

// Routes.
router.opts({name: 'users', path: '/users'}, passport.authenticate('jwt', { session: false }), opts.safeResource)
router.get('/users', passport.authenticate('jwt', { session: false }), user.list)

router.opts({name: 'user', path: '/users/:id'}, passport.authenticate('jwt', { session: false }), mw.getAuthLevel, (req, res, next) => { req.user.authorized ? opts.updateResource(req, res, next) : opts.safeResource(req, res, next) })
router.get('/users/:id', passport.authenticate('jwt', { session: false }), mw.getAuthLevel, user.info)
router.put('/users/:id', passport.authenticate('jwt', { session: false }), mw.authorize, user.update)
router.del('/users/:id', passport.authenticate('jwt', { session: false }), mw.authorize, user.delete)
/*
router.opts('/users/:id/desiredtrips', passport.authenticate('jwt', { session: false }), mw.authorize, opts.addResource)
router.get('/users/:id/desiredtrips', passport.authenticate('jwt', { session: false }), mw.authorize, dt.collection)
router.post('/users/:id/desiredtrips', passport.authenticate('jwt', { session: false }), mw.authorize, dt.add)

router.opts('/users/:id/driving', passport.authenticate('jwt', { session: false }), mw.authorize, opts.addResource)
router.get('/users/:id/driving', passport.authenticate('jwt', { session: false }), mw.authorize, pt.collectionByDriver)
router.post('/users/:id/driving', passport.authenticate('jwt', { session: false }), mw.authorize, pt.add)

router.opts('/users/:id/passenger', passport.authenticate('jwt', { session: false }), mw.authorize, opts.updateResource)
router.get('/users/:id/passenger', passport.authenticate('jwt', { session: false }), mw.authorize, pt.collectionByDriver)
router.put('/users/:id/passenger', passport.authenticate('jwt', { session: false }), mw.authorize, pt.addPassenger)
router.del('/users/:id/passenger', passport.authenticate('jwt', { session: false }), mw.authorize, pt.deletePassenger)*/

// Exports.
module.exports = router
