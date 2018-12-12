/*
* JSON LD + Hydra for a planned trip.
*/

/*
* JSON LD + Hydra for a planned trip.
*/

let jsonld = require('jsonld')

let userroute
let plannedtriproute

let baseContext
let baseResponse

let extendedContext
let extendedResponse

// Initialize server links
module.exports = function (server) {
  userroute = server.router.render('users')
  plannedtriproute = server.router.render('plannedtrip')
  baseContext =
  {
    'driver': {
      '@id': 'http://schema.org/agent',
      '@type': '@id'
    },
    'from': {
      '@id': 'http://schema.org/fromLocation'
    },
    'to': {
      '@id': 'http://schema.org/toLocation'
    },
    'seats': {
      '@id': 'http://schema.org/seatingCapacity'
    },
    'time': {
      '@id': 'http://schema.org/startDate'
    }
  }

  baseResponse = {}

  extendedContext = Object.assign({}, baseContext, {hydra: 'http://www.w3.org/ns/hydra/context.jsonld'}, {
    'passengers': {
      '@id': 'http://schema.org/participant',
      '@type': '@id'
    }
  })

  extendedResponse = Object.assign({}, baseResponse, {
    'hydra:operation': [{
      'hydra:action': 'UpdateAction',
      'hydra:method': 'PUT',
      'hydra:expects': {
        '@id': 'http://schema.org/Trip',
        'hydra:supportedProperty': [
          { 'hydra:property': 'from', 'hydra:range': 'Text' },
          { 'hydra:property': 'to', 'hydra:range': 'Text' },
          { 'hydra:property': 'seats', 'hydra:range': 'Number' },
          { 'hydra:property': 'time', 'hydra:range': 'Date' }
        ]
      }
    },
    {
      'hydra:action': 'DeleteAction',
      'hydra:method': 'DELETE'
    }]
  })
}

module.exports.getBaseTrip = function (trip) {
  return new Promise((resolve, reject) => {
    let id = plannedtriproute + ('/' + trip._id)
    baseResponse['@id'] = id
    baseResponse['http://schema.org/agent'] = userroute + ('/' + trip._creator)
    baseResponse['http://schema.org/fromLocation'] = trip.from
    baseResponse['http://schema.org/toLocation'] = trip.to
    baseResponse['http://schema.org/seatingCapacity'] = trip.spaces
    baseResponse['http://schema.org/startDate'] = trip.time

    jsonld.compact(baseResponse, baseContext, (err, compacted) => {
      if (err) reject(err)

      resolve(compacted)
    })
  })
}

module.exports.getExtendedTrip = function (trip) {
  return new Promise((resolve, reject) => {
    let id = plannedtriproute + ('/' + trip._id)
    extendedResponse['@id'] = id
    extendedResponse['http://schema.org/agent'] = userroute + ('/' + trip._creator)
    extendedResponse['http://schema.org/participant'] = trip.passengers.map((passenger) => { return {'@id': userroute + '/' + passenger} })
    extendedResponse['http://schema.org/fromLocation'] = trip.from
    extendedResponse['http://schema.org/toLocation'] = trip.to
    extendedResponse['http://schema.org/seatingCapacity'] = trip.spaces
    extendedResponse['http://schema.org/startDate'] = trip.time

    jsonld.compact(extendedResponse, extendedContext, (err, compacted) => {
      if (err) reject(err)

      resolve(compacted)
    })
  })
}
