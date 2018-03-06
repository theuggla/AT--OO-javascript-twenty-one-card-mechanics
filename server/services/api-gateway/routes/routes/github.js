/**
 * Router for the github service.
 */

// Requires.
let router = require('express').Router()
let axios = require('axios')
let jwt = require('./../../resources/auth/jwt')
let getOrganizations = require('./../handlers/organizationHandler').getOrganizations

// Routes.
router.route('/authorize')
  .post((req, res, next) => {
    let userJWT

    axios({
      method: 'put',
      headers: {'Authorization': 'Bearer ' + jwt.create(req.body)},
      url: process.env.GITHUB_SERVICE + '/user'
    })
    .then((response) => {
      userJWT = jwt.create(response.data)
      return res.json(userJWT)
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
            url: process.env.GITHUB_SERVICE + '/organizations/hooks/' + organization.login
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

// Exports.
module.exports = router
