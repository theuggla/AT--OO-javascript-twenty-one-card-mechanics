/*
* JSON LD + Hydra for a planned trip.
*/

let jsonld = require('jsonld')

let baseContext
let baseResponse

let extendedContext
let extendedResponse

let passengerResponse
let driverResponse

// Initialize server links
module.exports = function (server) {
  baseContext = [
    {
      'desiredTrips': {
        '@id': 'http://schema.org/ItemList',
        '@type': '@id'
      }
    }
  ]

  baseResponse = {
    '@id': server.router.render('plannedtrip'),
    'http://schema.org/ItemList': []
  }

  extendedContext = Object.assign({}, {hydra: 'http://www.w3.org/ns/hydra/context.jsonld'}, {
    'driver': {
      '@id': 'http://schema.org/agent',
      '@type': '@id'
    },
    'passengers': {
      '@id': 'http://schema.org/participant',
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
  })

  extendedResponse = {
    'hydra:member': [
      {
        '@id': server.router.render('plannedtrip'),
        'http://schema.org/agent': {'@id': server.router.render('users')},
        'http://schema.org/participant': {'@id': server.router.render('users')}
      }
    ]
  }

  passengerResponse = Object.assign({}, extendedResponse, {
    'hydra:operation': {
      'hydra:method': 'DELETE',
      'hydra:expects': {
        '@id': 'http://schema.org/Person'
      }
    }
  })

  driverResponse = Object.assign({}, extendedResponse, {
    'hydra:operation': [{
      'hydra:method': 'POST',
      'hydra:expects': {
        '@id': 'http://schema.org/Trip',
        'hydra:required': [
          { 'hydra:property': 'from', 'hydra:range': 'Text' },
          { 'hydra:property': 'to', 'hydra:range': 'Text' },
          { 'hydra:property': 'seats', 'hydra:range': 'Number' },
          { 'hydra:property': 'time', 'hydra:range': 'Date' }
        ]
      }
    }]
  })
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

module.exports.getPassengersList = function (trips) {
  return new Promise((resolve, reject) => {
    let mapped = trips.map(trip => {
      let id = passengerResponse['hydra:member'][0]['@id'] + ('/' + trip._id)

      return {
        '@id': id,
        'http://schema.org/agent': passengerResponse['hydra:member'][0]['http://schema.org/agent']['@id'] + ('/' + trip._creator),
        'http://schema.org/participant': trip.passengers.map((passenger) => { return {'@id': passengerResponse['hydra:member'][0]['http://schema.org/participant']['@id'] + '/' + passenger}}),
        'http://schema.org/fromLocation': trip.from,
        'http://schema.org/toLocation': trip.to,
        'http://schema.org/seatingCapacity': trip.spaces,
        'http://schema.org/startDate': trip.time
      }
    })

    passengerResponse['hydra:member'] = mapped

    jsonld.compact(passengerResponse, extendedContext, (err, compacted) => {
      if (err) reject(err)

      resolve(compacted)
    })
  })
}

module.exports.getDriverList = function (trips) {
  return new Promise((resolve, reject) => {
    let mapped = trips.map(trip => {
      let id = driverResponse['hydra:member'][0]['@id'] + ('/' + trip._id)

      return {
        '@id': id,
        'http://schema.org/agent': driverResponse['hydra:member'][0]['http://schema.org/agent']['@id'] + ('/' + trip._creator),
        'http://schema.org/participant': trip.passengers.map((passenger) => { return {'@id': driverResponse['hydra:member'][0]['http://schema.org/participant']['@id'] + '/' + passenger} }),
        'http://schema.org/fromLocation': trip.from,
        'http://schema.org/toLocation': trip.to,
        'http://schema.org/seatingCapacity': trip.spaces,
        'http://schema.org/startDate': trip.time
      }
    })

    driverResponse['hydra:member'] = mapped

    jsonld.compact(driverResponse, extendedContext, (err, compacted) => {
      if (err) reject(err)

      resolve(compacted)
    })
  })
}
