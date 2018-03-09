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
 * Creates the route that creates or finds a user.
 */
function createUserCreationRoutes () {
  router.route('/')
  .put(handler.createUser())
}

/**
 * Notifies the user of an event.
 */
function createNotifyRoutes () {
  router.route('/notify')
  .post(handler.notifyUser())
}

/**
 * Creates the route that subscribes or unsubscribes the user.
 */
function createUserSubscriptionRoutes () {
  router.route('/subscriptions/:id')
  .put(handler.subscribeUser())
  .delete(handler.unsubcribeUser())
}

// Exports.
module.exports.create = create
