var mongoose = require('mongoose')

let Schema = mongoose.Schema

let UserSchema = new Schema(
  {
    user: {type: String, required: true, unique: true},
    subscriptionID: {type: String, required: true},
    allowed: {
      organizations: {
        name: {type: String, required: true},
        repos: [{
          name: {type: String, required: true},
          eventTypes: [{type: [String]}]
        }]
      }
    }
  }
)

// Exports.
module.exports = mongoose.model('User', UserSchema)
