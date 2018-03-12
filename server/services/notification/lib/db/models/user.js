var mongoose = require('mongoose')

let Schema = mongoose.Schema

let UserSchema = new Schema(
  {
    user: {type: String, required: true, unique: true},
    subscriptions: [{type: String}],
    preferences: {
      organizations: [{
        name: {type: String},
        repos: [{
          name: {type: String},
          allowedEventTypes: [{type: [String]}]
        }]
      }]
    }
  }
)

// Exports.
module.exports = mongoose.model('User', UserSchema)
