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
router.get('/users/:id', passport.authenticate('jwt', { session: false }), mw.isAuthorized, user.info)

/*router.get('/desiredtrips/:id', desiredtrips.info)

router.get('/plannedtrips/:id', plannedtrips.info)*/

// Exports.
module.exports = router
