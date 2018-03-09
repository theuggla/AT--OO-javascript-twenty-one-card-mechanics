/**
 * Router for the notification service.
 */

// Requires.
let router = require('express').Router()
let handler = require('./../handlers/notification-handler')
let socket

/**
 * Creates the routes and listens to the event channel.
 * @param {EventEmitter} eventChannel the event channel for the server.
 * @param {Socket} websocket the websocket-connection of the server.
 */
function create (eventChannel, websocket) {
  handler(eventChannel)
  handler.handleNotificationEvents()

  createSubscriptionsRoutes()

  return router
}

/**
 * Creates the routes for adding or removing subscriptions.
 */
function createSubscriptionsRoutes (eventChannel) {
  router.route('/subscriptions/:id')
  .put(handler.authorizeUser(), handler.addSubscription())
  .delete(handler.removeSubscription())
}

// Exports.
module.exports.create = create
