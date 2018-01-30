/**
 * Router for the notification service.
 */

// Requires.
let router = require('express').Router()
let request = require('request')

// Routes.
router.route('/github-service')
    .get((req, res, next) => {
      request({ url: 'http://github:3000/',
        method: 'GET'
      }, (err, response, body) => {
        if (!err && res.statusCode === 200) {
          res.json(JSON.parse(body))
        } else {
          next(err, req, res)
        }
      })
    })

// Exports.
module.exports = router
