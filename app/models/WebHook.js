/**
 * A webhook model for mongoose.
 */

let mongoose = require('mongoose')
let bcrypt = require('bcrypt-nodejs')
let Schema = mongoose.Schema
let findOrCreate = require('mongoose-find-or-create')

let HookSchema = new Schema({
  callbackURL: {type: String},
  event: {type: String}
})

HookSchema.plugin(findOrCreate)

mongoose.model('Webhook', HookSchema)

module.exports = mongoose.model('Webhook')
