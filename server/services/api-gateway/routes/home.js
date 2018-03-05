/**
 * Router for the gateway-pages.
 */

// Requires.
let router = require('express').Router()
let axios = require('axios')
let jwt = require('./../resources/auth/jwt')

// Routes.
router.route('/')
  .get((req, res) => {
    res.json({message: 'Gateway on main'})
  })

router.route('/authorize/github')
  .post((req, res, next) => {
    let accessJWT = jwt.create(req.body)
    axios({
      method: 'put',
      headers: {'Authorization': 'Bearer ' + accessJWT},
      url: process.env.GITHUB_SERVICE + '/user'
    })
    .then((response) => {
      let userJWT = jwt.create(response.data)
      return res.json(userJWT)
    })
    .catch((err) => {
      return next({message: err})
    })
  })

// Exports.
module.exports = router
