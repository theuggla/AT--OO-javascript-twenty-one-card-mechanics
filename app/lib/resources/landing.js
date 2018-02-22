/*
* JSON LD + Hydra for the gateway pages trip.
*/

let jsonld = require('jsonld')

let userroute
let authroute
let ptroute

let baseContext
let baseResponse
let expandedResponse

// Initialize server links
module.exports = function (server) {
  userroute = server.router.render('users')
  authroute = server.router.render('authenticate')
  ptroute = server.router.render('plannedtrip')

  baseContext = [
    'http://www.w3.org/ns/hydra/core',
    {
      relatedLinks: {'@id': 'https://schema.org/relatedLink/', '@type': '@id'}
    }
  ]

  baseResponse = {
    '@id': server.router.render('home'),
    'https://schema.org/relatedLink/': [{'@id': ptroute}, {'@id': authroute}]
  }

  expandedResponse = {
    '@id': server.router.render('home'),
    'https://schema.org/relatedLink/': [{'@id': ptroute}, {'name': 'user', '@id': userroute}]
  }
}

// Authenticated user
module.exports.getExpanded = function (user) {
  return new Promise((resolve, reject) => {
    let userlinkIndex = expandedResponse['https://schema.org/relatedLink/'].findIndex((link) => { return link.name === 'user' })
    expandedResponse['https://schema.org/relatedLink/'][userlinkIndex]['@id'] = userroute + ('/' + user._id)

    jsonld.compact(expandedResponse, baseContext, (err, compacted) => {
      if (err) {
        reject(err)
      } else {
        resolve(compacted)
      }
    })
  })
}

// Unauthenticated user
module.exports.getBase = function () {
  return new Promise((resolve, reject) => {
    jsonld.compact(baseResponse, baseContext, (err, compacted) => {
      if (err) {
        reject(err)
      } else {
        resolve(compacted)
      }
    })
  })
}
