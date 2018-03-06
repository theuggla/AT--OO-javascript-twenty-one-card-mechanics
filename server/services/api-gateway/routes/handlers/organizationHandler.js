/**
 * Module to handle the organization routes against the github middleware.
 */

// Requires.
let axios = require('axios')

/**
 * Gets all of a users organizations.
 */
function getOrganizations (auth) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      headers: {'Authorization': auth},
      url: process.env.GITHUB_SERVICE + '/organizations'
    })
    .then((response) => {
      resolve(response.data)
    })
    .catch((error) => {
      reject({message: error})
    })
  })
}

 // Exports.
module.exports = {
  getOrganizations: getOrganizations
}
