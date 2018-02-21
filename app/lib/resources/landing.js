/*
* JSON LD + Hydra for a planned trip.
*/

let jsonld = require('jsonld')

let baseContext
let baseResponse

module.exports = function (server) {
  baseContext = {
    relatedLinks: {'@id': 'https://schema.org/relatedLink/', '@type': '@id'}
  }

  baseResponse = {
    '@id': server.router.render('home'),
    'https://schema.org/relatedLink/': [{'@id': server.router.render('authenticate')}, {'@id': 'tbd'}, {'@id': 'tbd'}]
  }
}

// Authenticated user

// Unauthenticated user
module.exports.getBase = function () {
  return new Promise((resolve, reject) => {
    console.log(baseResponse)
    jsonld.compact(baseResponse, baseContext, (err, compacted) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        console.log(compacted)
        resolve(compacted)
      }
    })
  })
}
