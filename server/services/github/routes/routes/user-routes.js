/**
 * Router for the user-services.
 */

// Requires.
let router = require('express').Router()
let handler = require('./../handlers/user-handler')

/**
 * Creates the routes.
 */
function create () {
  createUserRoutes()
  createLatestPollRoutes()

  return router
}

/**
 * Creates the route that creates or updates a user with an access token. Returns the username.
 */
function createUserRoutes () {
  router.route('/')
  .put(handler.updateUser())
}

/**
 * Update Users latest event poll time
 */
function createLatestPollRoutes () {
  router.route('/poll')
  .post(handler.setLatestPoll())
}

// Exports.
module.exports.create = create
