/*
* JSON LD + Hydra for a planned trip.
*/

let jsonld = require('jsonld')

let baseContext
let baseResponse
let expandedResponse

module.exports = function (server) {
  baseContext = {
    relatedLinks: {'@id': 'https://schema.org/relatedLink/', '@type': '@id'}
  }

  baseResponse = {
    '@id': server.router.render('home'),
    'https://schema.org/relatedLink/': [{'@id': 'tbd'}, {'@id': 'tbd'}, {'@id': server.router.render('authenticate')}]
  }

  expandedResponse = {
    '@id': server.router.render('home'),
    'https://schema.org/relatedLink/': [{'@id': 'tbd'}, {'@id': 'tbd'}, {'name': 'user', '@id': server.router.render('users')}]
  }
}

// Authenticated user
module.exports.getExpanded = function (user) {
  return new Promise((resolve, reject) => {
    let userlinkIndex = expandedResponse['https://schema.org/relatedLink/'].findIndex((link) => { return link.name === 'user' })
    expandedResponse['https://schema.org/relatedLink/'][userlinkIndex]['@id'] += ('/' + user._id)
    
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
