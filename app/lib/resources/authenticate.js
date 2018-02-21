/*
* JSON LD + Hydra for the authentication pages.
*/

let jsonld = require('jsonld')

let context
let response

// Initialize server links
module.exports = function (server) {
  context = [
    {'hydra': 'http://www.w3.org/ns/hydra/context.jsonld'}
  ]

  response = {
    '@id': server.router.render('home'),
    'hydra:operation': {
      'hydra:method': 'POST',
      'hydra:expects': {
        '@id': 'http://schema.org/Person',
        'hydra:required': [
              { 'hydra:property': 'email', 'hydra:range': 'Text' },
              { 'hydra:property': 'password', 'hydra:range': 'Text' }
        ]
      }
    }
  }
}

module.exports.getBase = function () {
  return new Promise((resolve, reject) => {
    jsonld.compact(response, context, (err, compacted) => {
      if (err) {
        reject(err)
      } else {
        resolve(compacted)
      }
    })
  })
}
