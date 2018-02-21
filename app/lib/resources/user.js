/*
* JSON LD + Hydra for users.
*/

const jsonld = require('jsonld')
let desiredtriproutes = require('../../routes/routers/desiredTripRouter')

let simpleUser = {
  'http://schema.org/name': '',
  'http://schema.org/email': '',
  'http://schema.org/image': {'@id': ''}
}

let expandedUser = Object.assign(simpleUser, {
  'desiredTrips': [{'@id': ''}],
  'driverOf': [{'@id': ''}],
  'passengerOf': [{'@id': ''}]
})

let simpleUserContext = {
  'name': 'http://schema.org/name',
  'email': 'http://schema.org/email',
  'image': {'@id': 'http://schema.org/image', '@type': '@id'}
}

let expandedUserContext = Object.assign(simpleUserContext, {
  'desiredTrips': {
    '@container': '@set'
  },
  'driverOf': {
    '@container': '@set'
  },
  'passengerOf': {
    '@container': '@set'
  }
})

// authenticated user
module.exports.getSimpleUser = function (user) {
  return new Promise((resolve, reject) => {
    simpleUser['http://schema.org/name'] = user.name
    simpleUser['http://schema.org/email'] = user.email
    simpleUser['http://schema.org/image']['@id'] = user.imageUrl

    jsonld.compact(simpleUser, simpleUserContext, (err, compacted) => {
      if (err) reject(err)

      resolve(compacted)
    })
  })
}

// authorized user
module.exports.getExpandedUser = function (user, desiredTrips, driverOf, passengerOf) {
  return new Promise((resolve, reject) => {
    expandedUser['http://schema.org/name'] = user.name
    expandedUser['http://schema.org/email'] = user.email
    expandedUser['http://schema.org/image']['@id'] = user.imageUrl

    expandedUser.desiredTrips = desiredTrips.map(trip => {
      return {'@id': desiredtriproutes.render('desiredtrip', {slug: trip._id})}
    })

    jsonld.compact(expandedUser, expandedUserContext, (err, compacted) => {
      if (err) reject(err)

      resolve(compacted)
    })
  })
}
