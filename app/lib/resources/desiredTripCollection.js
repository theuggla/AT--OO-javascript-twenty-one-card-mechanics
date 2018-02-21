/*
* JSON LD + Hydra for a planned trip.
*/

let jsonld = require('jsonld')

let baseContext
let baseResponse

// Initialize server links
module.exports = function (server) {
  baseContext = [
    'http://www.w3.org/ns/hydra/core',
    {
      'desiredTrips': {
        '@id': 'http://schema.org/ItemList',
        '@type': '@id'
      }
    }
  ]

  baseResponse = {
    '@id': server.router.render('desiredtrip'),
    'http://schema.org/ItemList': []
  }
}

// unauthenticated / authenticated user - general trips
module.exports.getList = function (allTrips) {
  return new Promise((resolve, reject) => {
    baseResponse['http://schema.org/ItemList'] = allTrips.map(trip => {
      let id = baseResponse['@id'] + ('/' + trip._id)
      return {'@id': id}
    })

    jsonld.compact(baseResponse, baseContext, (err, compacted) => {
      if (err) reject(err)

      resolve(compacted)
    })
  })
}

//authorized user - own trips