/**
 * Router for the preferences-services.
 */

// Requires.
let router = require('express').Router()
let handler = require('./../handlers/preferences-handler')

/**
 * Creates the routes.
 */
function create () {
  createPreferencesRoutes()

  return router
}

/**
 * Gets the offline notification preferences of a specific organization and repo for the authenticated user.
 */
function createPreferencesRoutes () {
  router.route('/:org/:repo')
  .get(handler.getPreferences())
  .put(handler.updatePreferences())
}

// Exports.
module.exports.create = create
