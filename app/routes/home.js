/**
 * Router for the gateway-pages.
 */

// Requires.
let router = require('express').Router()

// Routes.
router.route('/')
  .get((req, res) => {
    res.json({message: 'API on main'})
  })

// Exports.
module.exports = router
