var mongoose = require('mongoose')

let Schema = mongoose.Schema

let UserSchema = new Schema(
  {
    user: {type: String, required: true, unique: true},
    subscriptionIDs: {type: [String]},
    allowed: {
      organizations: {
        name: {type: String},
        repos: [{
          name: {type: String},
          eventTypes: [{type: [String]}]
        }]
      }
    }
  }
)

// Exports.
module.exports = mongoose.model('User', UserSchema)
