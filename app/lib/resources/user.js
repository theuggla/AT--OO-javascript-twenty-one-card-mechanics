/*
* JSON LD + Hydra for users.
*/

const jsonld = require('jsonld')

let userroute
let triproute

let baseContextUserList
let baseResponseUserList

let baseUserResponse
let baseUserContext

let expandedUserResponse
let expandedUserContext

// Initialize server links
module.exports = function (server) {
  userroute = server.router.render('users')
  triproute = server.router.render('plannedtrip')

  baseContextUserList = [
    {'hydra': 'http://www.w3.org/ns/hydra/context.jsonld'},
    {
      'users': {
        '@id': 'http://schema.org/ItemList',
        '@type': '@id'
      }
    }
  ]

  baseResponseUserList = {
    '@id': userroute,
    'http://schema.org/ItemList': []
  }

  baseUserContext = [
    {
      'image': { '@id': 'http://schema.org/image', '@type': '@id' },
      'email': {'@id': 'http://schema.org/email'},
      'name': {'@id': 'http://schema.org/name'}
    }
  ]

  baseUserResponse = {
    'http://schema.org/name': '',
    'http://schema.org/email': '',
    'http://schema.org/image': {'@id': ''},
  }

  expandedUserContext = Object.assign({}, {'hydra': 'http://www.w3.org/ns/hydra/context.jsonld'}, baseUserContext[0], {
    'driverOf': {
      '@id': 'http://schema.org/agent',
      '@type': '@id'
    },
    'passengerOf': {
      '@id': 'http://schema.org/participant',
      '@type': '@id'
    }
  })

  expandedUserResponse = Object.assign({}, baseUserResponse, {
    'hydra:operation': [{
      'hydra:method': 'PUT',
      'hydra:expects': {
        '@id': 'http://schema.org/Person',
        'hydra:supportedProperty': [
              { 'hydra:property': 'email', 'hydra:range': 'Text' },
              { 'hydra:property': 'name', 'hydra:range': 'Text' },
              { 'hydra:property': 'imageURL', 'hydra:range': 'url' }
        ]
      }
    },
    {
      'hydra:method': 'DELETE'
    }
    ]
  })
}

module.exports.getList = function (users) {
  return new Promise((resolve, reject) => {
    baseResponseUserList['http://schema.org/ItemList'] = users.map(trip => {
      let id = userroute + ('/' + trip._id)
      return {'@id': id}
    })

    jsonld.compact(baseResponseUserList, baseContextUserList, (err, compacted) => {
      if (err) reject(err)

      resolve(compacted)
    })
  })
}

// authenticated user
module.exports.getSimpleUser = function (user) {
  console.log('got simple user')
  console.log(user)
  return new Promise((resolve, reject) => {
    baseUserResponse['http://schema.org/name'] = user.name
    baseUserResponse['http://schema.org/email'] = user.email
    baseUserResponse['http://schema.org/image']['@id'] = user.imageUrl
    baseUserResponse['@id'] = userroute + ('/' + user._id)

    jsonld.compact(baseUserResponse, baseUserContext, (err, compacted) => {
      if (err) reject(err)

      resolve(compacted)
    })
  })
}

// authorized user
module.exports.getExpandedUser = function (user, driverOf, passengerOf) {
  return new Promise((resolve, reject) => {
    expandedUserResponse['http://schema.org/name'] = user.name
    expandedUserResponse['http://schema.org/email'] = user.email
    expandedUserResponse['http://schema.org/image']['@id'] = user.imageUrl
    expandedUserResponse['@id'] = userroute + ('/' + user._id)

    expandedUserResponse['http://schema.org/agent'] = driverOf.map(trip => {
      let id = userroute + ('/' + trip._id)
      return {'@id': id}
    })

    expandedUserResponse['http://schema.org/participant'] = passengerOf.map(trip => {
      let id = userroute + ('/' + trip._id)
      return {'@id': id}
    })

    jsonld.compact(expandedUserResponse, expandedUserContext, (err, compacted) => {
      if (err) reject(err)

      resolve(compacted)
    })
  })
}
