/**
 * Router for the github service.
 */

// Requires.
let router = require('express').Router()
let handler = require('./../handlers/github-handler')
let socket

/**
 * Creates the routes and listens to the event channel.
 * @param {EventEmitter} eventChannel the event channel for the server.
 * @param {Socket} websocket the websocket-connection of the server.
 */
function create (eventChannel, websocket) {
  handler(eventChannel)
  socket = websocket

  createAuthRoute()
  createOrganizationsRoute()
  createRecievedEventsRoute()

  return router
}

/**
 * Creates the authorization route returns a jwt to continue authorizing the user.
 */
function createAuthRoute (eventChannel) {
  router.route('/authorize')
  .post(handler.authorizeUser())
}

/**
 * Creates the route to retrieve an authenticated user's admin-organizations.
 */
function createOrganizationsRoute () {
  router.route('/organizations')
    .get(handler.getAdminOrganizations(), handler.createWebHooks())
}

/**
 * Creates the route for the callback from github webhooks.
 */
function createRecievedEventsRoute () {
  router.route('/event/:user/:organization')
    .post(handler.handleGithubEvents(socket))
}

// Exports.
module.exports.create = create
