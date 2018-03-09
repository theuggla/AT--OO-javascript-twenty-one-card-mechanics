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
      req.result = req.result || {}
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
  console.log('looking for events')
  return function (req, res, next) {
    console.log(req.user)
    console.log('user has latest event poll: ')
    console.log(req.user.poll.latestETag)

    let axiosOptions = {
      method: 'GET',
      headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
      url: 'https://api.github.com/users/' + req.user.user + '/events/orgs/' + req.params.org
    }

    if (req.user.poll.latestETag) {
      console.log('we understood that the event poll existed')
      axiosOptions.validateStatus = function (status) {
        return status >= 200 && status <= 304
      }
      axiosOptions.headers['If-None-Match'] = req.user.poll.latestETag
    }

    axios(axiosOptions)
    .then((response) => {
      let relevantEventList

      if (response.status === 304) {
        console.log('github says no update')
        relevantEventList = []
      } else {
        relevantEventList = response.data.filter((event) => {
          console.log(event.created_at)
          console.log(req.user.poll.atTime)
          let eventType = (event.type.charAt(0).toLowerCase() + event.type.slice(1)).replace('Event', '')
          return new Date(event.created_at) > req.user.poll.atTime && relevantEvents.indexOf(eventType) !== -1
        })
      }

      console.log('we will be returning ' + relevantEventList.length + ' events')

      return relevantEventList
    })
    .then((events) => {
      req.result = req.result || {}
      req.result.events = events
      return next()
    })
    .catch((error) => {
      return next(error)
    })
  }
}
