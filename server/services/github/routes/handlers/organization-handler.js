/**
 * Module to handle the organization routes.
 */

// Requires.
let axios = require('axios')
let relevantEvents = ['push', 'repository', 'release']
let User = require('./../../lib/db/models/user')

/**
 * Returns the github organizations that the authenticated user is an administrator for.
 */
module.exports.getOrganizations = function getOrganizations () {
  return function (req, res, next) {
    axios({
      method: 'GET',
      headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
      url: 'https://api.github.com/user/memberships/orgs'
    })
    .then((response) => {
      return response.data.filter((organization) => {
        return organization.role === 'admin'
      })
    })
    .then((adminOrgs) => {
      req.result.organizations = adminOrgs.map((org) => { return org.organization })
      return next()
    })
    .catch((error) => {
      req.error = error
      return next()
    })
  }
}

/**
 * Creates a webhook for the given organization, if there isn't one already.
 */
module.exports.setWebhook = function getOrganizations () {
  return function (req, res, next) {
    axios({
      method: 'GET',
      headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
      url: 'https://api.github.com/orgs/' + req.params.id + '/hooks'
    })
    .then((response) => {
      let exists = response.data.find((hook) => {
        return hook.config.url === req.body.callback
      })

      if (exists) return Promise.resolve()

      return axios({
        method: 'POST',
        headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
        url: 'https://api.github.com/orgs/' + req.params.id + '/hooks',
        data: {
          'name': 'web',
          'events': relevantEvents,
          'config': {
            'url': req.body.callback,
            'content_type': 'json'
          }
        }
      })
    })
    .then(() => {
      req.status = 201
      return next()
    })
    .catch((error) => {
      return next(error)
    })
  }
}

/**
 * Returns a list of relevant events for the given organization.
 * If a user has a latestEventPoll-recorded time, returns the events since that time.
 * Otherwise return max the 30 latest events.
 */
module.exports.getEvents = function getEvents () {
  return function (req, res, next) {
    User.findOne({user: req.user.user})
    .then((user) => {
      if (!user) throw new Error({message: 'This should not be possible'})

      if (user.latestEventPoll) {
        return axios({
          method: 'GET',
          headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json', 'If-None-Match': '"' + user.latestEventPoll + '"'},
          url: 'https://api.github.com/users/' + req.user.user + '/events/orgs/' + req.params.org
        })
      } else {
        return axios({
          method: 'GET',
          headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
          url: 'https://api.github.com/users/' + req.user.user + '/events/orgs/' + req.params.org
        })
      }
    })
    .then((response) => {
      let relevantEventList = response.body.filter((event) => {
        return relevantEvents.indexOf(event.type) !== -1
      })

      return relevantEventList
    })
    .then((events) => {
      req.result.events = events
      return next()
    })
    .catch((error) => {
      return next(error)
    })
  }
}
