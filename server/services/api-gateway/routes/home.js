/**
 * Router for the login and logout pages.
 */

// Requires.
let router = require('express').Router()
let passport = require('passport')
let jwtcreator = require('../resources/auth/jwt')
let axios = require('axios')

// Routes.
router.route('/')
    .get((req, res) => {
      res.json({message: 'Gateway on main'})
    })

/**
 * Authenticate the user through github, request scopes.
 */
router.route('/login')
    .get(passport.authenticate('github', {scope: ['user', 'repo', 'admin:org_hook']}))

/**
 * Handle the authentication.
 */
router.route('/login/success')
    .get((req, res, next) => {
      passport.authenticate('github', (err, user) => {
        if (err) {
          return next(err)
        } else {
          let jwt = jwtcreator.create({user: user.username})

          axios({
            method: 'put',
            headers: {'Authorization': 'Bearer ' + jwt},
            url: process.env.GITHUB_SERVICE + '/user',
            data: {
              accessToken: user.accessToken
            }
          })
          .then((response) => {
            res.set('Authorization', 'Bearer ' + jwt)
            return res.json(user)
          })
          .catch((err) => {
            return next({message: err})
          })
        }
      })(req, res, next)
    })

// Exports.
module.exports = router
