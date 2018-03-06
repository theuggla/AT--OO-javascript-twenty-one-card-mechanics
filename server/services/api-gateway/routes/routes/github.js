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
            data: {callback: process.env.CURRENT_URL + '/github/event/' + req.user + '/' + organization.login}
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

router.route('/event/:user/:organization')
    .post((req, res, next) => {
      let type = req.headers['x-github-event']
      let data = req.data
      let userIsOnline = socket.userConnected(req.params.user, req.params.organization)

      if (userIsOnline) {
        socket.sendMessage(0, {type: type, data: data})
      } else {
        console.log('user not online')
        // send offline notification
      }
    })

// Exports.
module.exports = router
