/**
 * Hander for Gateway pages.
 */

 // Requires
 let passport = require('passport')
 let landing = require('../../lib/resources/landing')

 // Handlers
 module.exports.landing = function (req, res, next) {
   passport.authenticate('jwt', function (err, user, info) {
     if (err) { return next(err) }

     if (!user) {
       landing.getBase()
       .then((response) => {
         return res.send(response)
       })
     } else {
       landing.getExpanded(user)
      .then((response) => {
        return res.send(response)
      })
     }
   })(req, res, next)
 }
