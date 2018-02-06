/**
 * Router for the login and logout pages.
 */

// Requires.
let router = require('express').Router()
let passport = require('passport')
let jwt = require('../resources/auth/jwt')

// Routes.
router.route('/')
    .get((req, res) => {
      res.json({message: 'Gateway on main'})
    })

/**
 * Authenticate the user through github, request scopes.
 */
router.route('/login')
    .get(passport.authenticate('github', {scope: ['user']}))

/**
 * Handle the authentication.
 */
router.route('/login/success')
    .get((req, res, next) => {
      passport.authenticate('github', (err, user) => {
        if (err) {
          return next(err)
        } else {
          res.set('Authorization', 'Bearer ' + jwt.create({user: user.username}))
          return res.json(user)
        }
      })(req, res, next)
    })

// Exports.
module.exports = router
