/**
 * Router for the organization-services.
 */

// Requires.
let router = require('express').Router()
let handler = require('./../handlers/organization-handler')

/**
 * Creates the routes.
 */
function create () {
  createOrganizationsRoutes()
  createHooksRoutes()
  createRepoRoutes()
  createEventsRoutes()

  return router
}

/**
 * Creates the route that creates or updates a user with an access token. Returns the username.
 */
function createOrganizationsRoutes () {
  router.route('/')
  .get(handler.getOrganizations())
}

function createRepoRoutes () {
  router.route('/:org/repos')
  .get(handler.getRepos())
}

function createHooksRoutes () {
  router.route('/hooks/:id')
  .put(handler.setWebhook())
}

function createEventsRoutes () {
  router.route('/:org/events')
  .get(handler.getEvents())
}

// Exports.
module.exports.create = create
