/**
 * A module to execute commands against the database.
 * Returns JavaScript-objects.
 */

let User = require('../../models/User')

function findUser (id) {
  return new Promise((resolve, reject) => {
    User.findById(id)
    .then((user) => {
      if (user) {
        resolve(user)
      } else {
        throw new Error()
      }
    })
    .catch((error) => {
      reject(error)
    })
  })
}

module.exports = {
  findUser: findUser
}
