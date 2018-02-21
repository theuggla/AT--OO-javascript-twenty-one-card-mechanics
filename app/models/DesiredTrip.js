/**
 * Model for an Desired trip to be stored in the database.
 */

// Requires.
let mongoose = require('mongoose')
let tripBase = require('./TripBase')
let findOrCreate = require('mongoose-find-or-create')

/**
 * Set up additional parameters for the Trip.
 */
let desiredTripSchema = tripBase({
  earliest: {type: Date},
  latest: {type: Date}
})

desiredTripSchema.plugin(findOrCreate)

/**
 * Model the trip.
 */
let DesiredTrip = mongoose.model('DesiredTrip', desiredTripSchema)

// Exports.
module.exports = DesiredTrip
