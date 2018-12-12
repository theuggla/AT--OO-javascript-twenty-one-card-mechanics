/**
 * A webhook model for mongoose.
 */

let mongoose = require('mongoose')
let Schema = mongoose.Schema
let findOrCreate = require('mongoose-find-or-create')

let HookSchema = new Schema({
  callbackURL: {type: String},
  event: {type: String}
})

HookSchema.plugin(findOrCreate)

mongoose.model('WebHook', HookSchema)

module.exports = mongoose.model('WebHook')
