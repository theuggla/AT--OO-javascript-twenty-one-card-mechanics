/**
 * Router for the notification service.
 */

// Requires.
let router = require('express').Router()
let request = require('request')
let log = require('log-to-file')

// Routes.
router.route('/notification-service')
    .get((req, res, next) => {
      request({ url: 'http://notification:3000/',
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
