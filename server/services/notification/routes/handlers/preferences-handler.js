/**
 * Module to handle the preferences routes.
 */

let User = require('./../../lib/db/models/user')

/**
 * Gets the preferences for a certain organization and repo.
 */
module.exports.getPreferences = function getPreferences () {
  return function (req, res, next) {
    let org
    let repo

    org = req.user.preferences.organizations.find((organization) => {
      return organization.name === req.params.org
    })

    if (org) {
      repo = org.repos.find((repo) => {
        return repo.name === req.params.repo
      })
    }

    req.result = req.result || {}
    req.result.preferences = repo ? repo.allowedEventTypes : []

    return next()
  }
}

/**
 * Updates the preferences for a certain organization and repo.
 */
module.exports.updatePreferences = function updatePreferences () {
  return function (req, res, next) {
    let orgIndex
    let repoIndex

    User.findOne({user: req.user.user})
    .then((user) => {
      orgIndex = user.preferences.organizations.findIndex((organization) => {
        return organization.name === req.params.org
      })

      if (orgIndex > -1) {
        repoIndex = user.preferences.organizations[orgIndex].repos.findIndex((repo) => {
          return repo.name === req.params.repo
        })
      }

      if (repoIndex > -1) {
        user.preferences.organizations[orgIndex].repos[repoIndex].allowedEventTypes = req.body.allowed
      } else if (orgIndex > -1 && user.preferences.organizations[orgIndex].repos) {
        user.preferences.organizations[orgIndex].repos.push({name: req.params.repo, allowedEventTypes: req.body.allowed})
      } else if (orgIndex > -1) {
        user.preferences.organizations[orgIndex].repos = [{name: req.params.repo, allowedEventTypes: req.body.allowed}]
      } else if (user.organizations) {
        user.preferences.organizations.push({name: req.params.org, repos: [{name: req.params.repo, allowedEventTypes: req.body.allowed}]})
      } else {
        user.preferences.organizations = [{name: req.params.org, repos: [{name: req.params.repo, allowedEventTypes: req.body.allowed}]}]
      }

      console.log('saving')
      console.log(user)

      user.save()
      req.status = 202
      return next()
    })
  }
}
