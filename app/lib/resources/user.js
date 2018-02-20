/*
* JSON LD + Hydra for users.
*/

const jsonld = require('jsonld')

var doc = {
  'http://schema.org/name': '',
  'http://schema.org/email': '',
  'http://schema.org/image': {'@id': ''}
}
var context = {
  'name': 'http://schema.org/name',
  'homepage': 'http://schema.org/email',
  'image': {'@id': 'http://schema.org/image', '@type': '@id'}
}

// authenticated user
module.exports.getUser = function (user) {
  doc['http://schema.org/name'] = user.name
  doc['http://schema.org/email'] = user.email
  doc['http://schema.org/image']['@id'] = user.imageUrl

  jsonld.compact(doc, context, (err, compacted) => {
    console.log(JSON.stringify(compacted, null, 2))
    return compacted
  })
}

// authorized user
