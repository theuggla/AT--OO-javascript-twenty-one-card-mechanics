/*
* JSON LD + Hydra for the hook pages.
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
    '@id': server.router.render('pthook'),
    'hydra:operation': {
      'hydra:method': 'POST',
      'hydra:expects': {
        'hydra:required': [
              { 'hydra:property': 'callbackURL', 'hydra:range': 'URL' }
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