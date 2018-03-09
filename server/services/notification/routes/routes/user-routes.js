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
  createUserCreationRoutes()
  createNotifyRoutes()
  createUserSubscriptionRoutes()

  return router
}

/**
 * Creates the route that creates or a user.
 */
function createUserCreationRoutes () {
  router.route('/')
  .post(handler.createUser())
}

/**
 * Creates the route that subscribes or unsubscribes the user.
 */
function createUserSubscriptionRoutes () {
  router.route('/:id')
  .put(handler.subscribeUser())
  .delete(handler.unsubscribeUser())
}

/**
 * Notifies the user of an event.
 */
function createNotifyRoutes () {
  router.route('/:id/notify')
  .post(handler.notifyUser())
}

// Exports.
module.exports.create = create
