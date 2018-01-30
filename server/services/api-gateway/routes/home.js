/**
 * Router for the login and logout pages.
 */

// Requires.
let router = require('express').Router()
let passport = require('passport')

// Routes.
router.route('/')
    .get((req, res) => {
      res.json({message: 'Gateway on main'})
    })

/**
 * Authenticate the user through github, request scopes.
 */
router.route('/login/github')
    .get(passport.authenticate('github', {scope: ['user']}))

/**
 * Handle the authentication.
 */
router.route('/login-successful')
    .get((req, res, next) => {
      passport.authenticate('github', (err, user) => {
        console.log(user)
        return res.json(user)
      })(req, res, next)
    })

// Exports.
module.exports = router
