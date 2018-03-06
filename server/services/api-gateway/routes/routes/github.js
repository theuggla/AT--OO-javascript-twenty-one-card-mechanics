/**
 * Router for the github service.
 */

// Requires.
let router = require('express').Router()
let axios = require('axios')
let jwt = require('./../../resources/auth/jwt')
let getOrganizations = require('./../handlers/organizationHandler').getOrganizations
let socket = require('./../websocket/socket-server')

// Routes.
router.route('/authorize')
  .post((req, res, next) => {
    axios({
      method: 'put',
      headers: {'Authorization': 'Bearer ' + jwt.create(req.body)},
      url: process.env.GITHUB_SERVICE + '/user'
    })
    .then((response) => {
      return res.json(jwt.create(response.data))
    })
    .catch((err) => {
      return next({message: err})
    })
  })

router.route('/organizations')
    .get((req, res, next) => {
      let hookedOrganizations

      getOrganizations(req.headers.authorization)
      .then((organizations) => {
        hookedOrganizations = organizations

        let hooks = organizations.map((organization) => {
          return axios({
            method: 'put',
            headers: {'Authorization': req.headers.authorization},
            url: process.env.GITHUB_SERVICE + '/organizations/hooks/' + organization.login,
            data: {callback: process.env.CURRENT_URL + '/github/event/' + req.user}
          })
        })
        return Promise.all(hooks)
      })
      .then((result) => {
        res.json(hookedOrganizations)
      })
      .catch((error) => {
        next(error)
      })
    })

router.route('/event/:user')
    .post((req, res, next) => {
      console.log(req.headers)
      console.log(req.data)
      console.log(socket.userConnected(req.params.user, 0))
      console.log(socket.userConnected(req.params.user, 1))
      socket.sendMessage(0, {message: 'hello'})
    })

// Exports.
module.exports = router
