/**
 * Router for the github service.
 */

// Requires.
let router = require('express').Router()
let axios = require('axios')

// Routes.
router.route('/organizations')
    .get((req, res, next) => {
      axios({
        method: 'get',
        headers: {'Authorization': req.headers.authorization},
        url: process.env.GITHUB_SERVICE + '/organizations'
      })
      .then((response) => {
        return res.json(response.data)
      })
      .catch((err) => {
        return next({message: err})
      })
    })

// Exports.
module.exports = router
