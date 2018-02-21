/**
 * Hander for Gateway pages.
 */

 // Requires
 let passport = require('passport')
 let landing = require('../../lib/resources/landing')

 // Handlers
 module.exports.landing = function (req, res, next) {
   console.log('in landing handler')
   passport.authenticate('jwt', function (err, user, info) {
     console.log('in passport auth cb')
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
